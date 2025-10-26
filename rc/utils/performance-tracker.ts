import fs from "node:fs";
import path from "node:path";

export interface PerformanceMetrics {
  requestId: string;
  modelName: string;
  provider: string; // 'openai' | 'openrouter'
  startTime: number;
  endTime: number;
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  tokensPerSecond?: number;
  messageContent: string;
  responseContent: string;
  errorOccurred: boolean;
  errorMessage?: string;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  
  startRequest(requestId: string, modelName: string, provider: string, message: string): number {
    const startTime = Date.now();
    console.log(`⏱️  [${requestId}] Request started - Model: ${modelName} via ${provider}`);
    return startTime;
  }
  
  endRequest(
    requestId: string,
    startTime: number,
    modelName: string,
    provider: string,
    messageContent: string,
    responseContent: string,
    tokenUsage?: { prompt: number; completion: number; total: number }
  ): PerformanceMetrics {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const tokensPerSecond = tokenUsage 
      ? (tokenUsage.completion / (durationMs / 1000))
      : undefined;
    
    const metric: PerformanceMetrics = {
      requestId,
      modelName,
      provider,
      startTime,
      endTime,
      durationMs,
      messageContent,
      responseContent,
      errorOccurred: false,
      ...(tokenUsage?.prompt && { promptTokens: tokenUsage.prompt }),
      ...(tokenUsage?.completion && { completionTokens: tokenUsage.completion }),
      ...(tokenUsage?.total && { totalTokens: tokenUsage.total }),
      ...(tokensPerSecond && { tokensPerSecond: parseFloat(tokensPerSecond.toFixed(2)) }),
    };
    
    this.metrics.push(metric);
    
    console.log(`✅ [${requestId}] Completed in ${durationMs}ms`);
    if (tokensPerSecond) {
      console.log(`   📊 ${tokenUsage?.completion} tokens @ ${tokensPerSecond.toFixed(1)} tok/s`);
    }
    
    return metric;
  }
  
  recordError(requestId: string, modelName: string, provider: string, error: string): void {
    const metric: PerformanceMetrics = {
      requestId,
      modelName,
      provider,
      startTime: Date.now(),
      endTime: Date.now(),
      durationMs: 0,
      messageContent: '',
      responseContent: '',
      errorOccurred: true,
      errorMessage: error,
    };
    
    this.metrics.push(metric);
    console.error(`❌ [${requestId}] Error: ${error}`);
  }
  
  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }
  
  getSummary(): {
    totalRequests: number;
    successRate: number;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    avgTokensPerSecond?: number;
    byProvider: Record<string, {
      count: number;
      avgDurationMs: number;
      avgTokensPerSecond?: number;
    }>;
  } {
    const successful = this.metrics.filter(m => !m.errorOccurred);
    const totalRequests = this.metrics.length;
    const successRate = totalRequests > 0 ? (successful.length / totalRequests) * 100 : 0;
    
    if (successful.length === 0) {
      return {
        totalRequests,
        successRate: 0,
        avgDurationMs: 0,
        minDurationMs: 0,
        maxDurationMs: 0,
        byProvider: {},
      };
    }
    
    const durations = successful.map(m => m.durationMs);
    const avgDurationMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDurationMs = Math.min(...durations);
    const maxDurationMs = Math.max(...durations);
    
    const tokensPerSecondValues = successful
      .map(m => m.tokensPerSecond)
      .filter((v): v is number => v !== undefined);
    const avgTokensPerSecond = tokensPerSecondValues.length > 0
      ? tokensPerSecondValues.reduce((a, b) => a + b, 0) / tokensPerSecondValues.length
      : undefined;
    
    // Group by provider
    const byProvider: Record<string, any> = {};
    ['openai', 'openrouter'].forEach(provider => {
      const providerMetrics = successful.filter(m => m.provider === provider);
      if (providerMetrics.length > 0) {
        const providerDurations = providerMetrics.map(m => m.durationMs);
        const providerTokens = providerMetrics
          .map(m => m.tokensPerSecond)
          .filter((v): v is number => v !== undefined);
        
        const avgProviderTokensPerSecond = providerTokens.length > 0
          ? providerTokens.reduce((a, b) => a + b, 0) / providerTokens.length
          : undefined;
        
        byProvider[provider] = {
          count: providerMetrics.length,
          avgDurationMs: providerDurations.reduce((a, b) => a + b, 0) / providerDurations.length,
          ...(avgProviderTokensPerSecond && { avgTokensPerSecond: avgProviderTokensPerSecond }),
        };
      }
    });
    
    return {
      totalRequests,
      successRate,
      avgDurationMs,
      minDurationMs,
      maxDurationMs,
      ...(avgTokensPerSecond && { avgTokensPerSecond }),
      byProvider,
    };
  }
  
  exportMetrics(filename: string = 'performance-metrics.json'): void {
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getSummary(),
    }, null, 2));
    console.log(`📁 Metrics exported to: ${filepath}`);
  }
}

export const performanceTracker = new PerformanceTracker();
