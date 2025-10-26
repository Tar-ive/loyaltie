import fs from "node:fs/promises";
import path from "node:path";
import { Agent, AgentInputItem, Runner } from "@openai/agents";
import { SystemLogger, LogCategory } from "../logging/system-logger";
import { AniketProfile } from "../persona-agent";
import { getDefaultModel } from "../config/model-config";

export interface ProfileUpdateCandidate {
  field: string;
  currentValue: any;
  newValue: any;
  confidence: "high" | "medium" | "low";
  source: string;
  suggestedAction: "append" | "replace" | "merge";
}

export class ProfileUpdater {
  private logger: SystemLogger;
  private profilePath: string;

  constructor(logger: SystemLogger) {
    this.logger = logger;
    this.profilePath = path.resolve(
      __dirname,
      "../data/aniket_profile.json"
    );
  }

  async extractLearnings(
    conversationHistory: AgentInputItem[],
    sessionId: string
  ): Promise<ProfileUpdateCandidate[]> {
    this.logger.debug(
      LogCategory.PROFILE_UPDATE,
      "Extracting learnings from conversation"
    );

    // Format conversation for analysis
    const conversationText = conversationHistory
      .map((item, idx) => {
        const role = "role" in item && item.role === "user" ? "Customer" : "Agent";
        const content = this.extractContent(item);
        return `[Turn ${idx + 1}] ${role}: ${content}`;
      })
      .join("\n\n");

    const extractionPrompt = `Analyze this customer service conversation and extract any NEW information about the customer that should be added to their profile.

Look for:
- New delivery addresses (building names, street addresses, office locations)
- New contact information (phone numbers, email addresses, contact persons)
- New event types or use cases mentioned
- New food preferences, dietary restrictions, or allergies
- New budget patterns or spending insights
- New communication preferences
- New team information (headcount ranges, departments)
- New company milestones, events, or projects mentioned

Conversation:
${conversationText}

Return ONLY a valid JSON array of updates with this exact format:
[
  {
    "field": "delivery_addresses",
    "currentValue": null,
    "newValue": "NVIDIA Austin Office, Building 2, 500 W 2nd St",
    "confidence": "high",
    "source": "User mentioned in turn 3",
    "suggestedAction": "append"
  }
]

Rules:
- Only include CONFIDENT, EXPLICIT extractions from the conversation
- Do not infer or assume information not directly stated
- If nothing new was learned, return an empty array: []
- Ensure valid JSON format
- Do not include explanatory text, only the JSON array`;

    try {
      const runner = new Runner();
      const extractionAgent = new Agent({
        name: "ProfileExtractor",
        instructions: extractionPrompt,
        model: getDefaultModel(),
        modelSettings: { temperature: 0.1, store: true },
      });

      const result = await runner.run(extractionAgent, []);

      if (result.finalOutput) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = result.finalOutput.match(/\[[\s\S]*\]/);
          const jsonText = jsonMatch ? jsonMatch[0] : result.finalOutput;
          const parsed = JSON.parse(jsonText);

          if (Array.isArray(parsed)) {
            this.logger.info(
              LogCategory.PROFILE_UPDATE,
              `Extracted ${parsed.length} learning candidates`
            );
            return parsed;
          }
        } catch (e) {
          this.logger.error(
            LogCategory.PROFILE_UPDATE,
            "Failed to parse extraction result",
            e as Error,
            { response: result.finalOutput }
          );
        }
      }
    } catch (error) {
      this.logger.error(
        LogCategory.PROFILE_UPDATE,
        "Failed to extract learnings",
        error as Error
      );
    }

    return [];
  }

  async applyUpdates(candidates: ProfileUpdateCandidate[]): Promise<void> {
    if (candidates.length === 0) return;

    this.logger.info(
      LogCategory.PROFILE_UPDATE,
      `Applying ${candidates.length} profile updates`
    );

    const profile = await this.loadProfile();

    for (const candidate of candidates) {
      if (candidate.confidence !== "low") {
        this.logger.info(
          LogCategory.PROFILE_UPDATE,
          `Applying update to ${candidate.field}`,
          {
            action: candidate.suggestedAction,
            value: candidate.newValue,
          }
        );

        try {
          await this.applyUpdate(profile, candidate);
        } catch (error) {
          this.logger.error(
            LogCategory.PROFILE_UPDATE,
            `Failed to apply update to ${candidate.field}`,
            error as Error
          );
        }
      }
    }

    await this.saveProfile(profile);
  }

  private async applyUpdate(
    profile: AniketProfile,
    candidate: ProfileUpdateCandidate
  ): Promise<void> {
    const fieldPath = candidate.field.split(".");

    if (candidate.suggestedAction === "append") {
      // Add to array
      const target = this.getNestedField(profile, fieldPath);
      if (Array.isArray(target)) {
        // Check for duplicates
        const newValueStr = JSON.stringify(candidate.newValue);
        const exists = target.some(
          (item) => JSON.stringify(item) === newValueStr
        );
        if (!exists) {
          target.push(candidate.newValue);
        }
      } else {
        // Create array if doesn't exist
        this.setNestedField(profile, fieldPath, [candidate.newValue]);
      }
    } else if (candidate.suggestedAction === "replace") {
      this.setNestedField(profile, fieldPath, candidate.newValue);
    } else if (candidate.suggestedAction === "merge") {
      const target = this.getNestedField(profile, fieldPath);
      if (typeof target === "object" && typeof candidate.newValue === "object") {
        this.setNestedField(profile, fieldPath, {
          ...target,
          ...candidate.newValue,
        });
      } else {
        this.setNestedField(profile, fieldPath, candidate.newValue);
      }
    }
  }

  private async loadProfile(): Promise<AniketProfile> {
    const data = await fs.readFile(this.profilePath, "utf8");
    return JSON.parse(data);
  }

  private async saveProfile(profile: AniketProfile): Promise<void> {
    // Create backup
    const backupPath = this.profilePath.replace(
      ".json",
      `.backup_${Date.now()}.json`
    );
    await fs.copyFile(this.profilePath, backupPath);

    // Save updated profile
    await fs.writeFile(
      this.profilePath,
      JSON.stringify(profile, null, 2),
      "utf8"
    );

    this.logger.info(
      LogCategory.PROFILE_UPDATE,
      "Profile updated successfully",
      { backupPath }
    );
  }

  private getNestedField(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  private setNestedField(obj: any, path: string[], value: any): void {
    if (path.length === 0) return;

    const lastKey = path[path.length - 1];
    const parentPath = path.slice(0, -1);

    let target = obj;
    for (const key of parentPath) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    target[lastKey] = value;
  }

  private extractContent(item: AgentInputItem): string {
    if ("content" in item && Array.isArray(item.content)) {
      return item.content
        .map((c: any) => {
          if (c.type === "input_text" || c.type === "output_text") {
            return c.text;
          }
          return "";
        })
        .join(" ");
    }
    return "";
  }
}
