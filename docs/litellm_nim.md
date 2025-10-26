Nvidia NIM
https://docs.api.nvidia.com/nim/reference/

tip
We support ALL Nvidia NIM models, just set model=nvidia_nim/<any-model-on-nvidia_nim> as a prefix when sending litellm requests

Property	Details
Description	Nvidia NIM is a platform that provides a simple API for deploying and using AI models. LiteLLM supports all models from Nvidia NIM
Provider Route on LiteLLM	nvidia_nim/
Provider Doc	Nvidia NIM Docs ↗
API Endpoint for Provider	https://integrate.api.nvidia.com/v1/ (chat/embeddings), https://ai.api.nvidia.com/v1/ (rerank)
Supported OpenAI Endpoints	/chat/completions, /completions, /responses, /embeddings, /rerank
API Key
# env variable
os.environ['NVIDIA_NIM_API_KEY'] = ""
os.environ['NVIDIA_NIM_API_BASE'] = "" # [OPTIONAL] - default is https://integrate.api.nvidia.com/v1/


Sample Usage
```python
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)
print(response)

Sample Usage - Streaming
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)

for chunk in response:
    print(chunk)

Usage - embedding
import litellm
import os

response = litellm.embedding(
    model="nvidia_nim/nvidia/nv-embedqa-e5-v5",               # add `nvidia_nim/` prefix to model so litellm knows to route to Nvidia NIM
    input=["good morning from litellm"],
    encoding_format = "float", 
    user_id = "user-1234",

    # Nvidia NIM Specific Parameters
    input_type = "passage", # Optional
    truncate = "NONE" # Optional
)
print(response)


Usage - LiteLLM Proxy Server
Here's how to call an Nvidia NIM Endpoint with the LiteLLM Proxy Server

Modify the config.yaml
model_list:
  - model_name: my-model
    litellm_params:
      model: nvidia_nim/<your-model-name>  # add nvidia_nim/ prefix to route as Nvidia NIM provider
      api_key: api-key                 # api key to send your model
     # api_base: "" # [OPTIONAL] - default is https://integrate.api.nvidia.com/v1/


Start the proxy
$ litellm --config /path/to/config.yaml

Send Request to LiteLLM Proxy Server
OpenAI Python v1.0.0+
curl
import openai
client = openai.OpenAI(
    api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000" # litellm-proxy-base url
)

response = client.chat.completions.create(
    model="my-model",
    messages = [
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
)

print(response)
```
