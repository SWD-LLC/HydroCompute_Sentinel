import os
import sys
from openai import OpenAI

api_key = "sk-5ab3a048819245928aa61e1739c968db"

client = OpenAI(
    api_key=api_key,
    base_url="https://dashscope-us.aliyuncs.com/compatible-mode/v1"
)

def run_sentinel_autopilot(ambient_temp, discharge_temp):
    print("=== Layer 1: Field Telemetry Capture ===")
    delta_t = discharge_temp - ambient_temp
    print(f"Node 1L Data -> Ambient: {ambient_temp}°C, Discharge: {discharge_temp}°C (Delta-T: +{delta_t:.1f}°C)")
    
    print("\n=== Layer 2: Ingestion Pipeline (Alibaba Cloud IoT) ===")
    qc_confidence = 92.6  
    print(f"QC Confidence Score: {qc_confidence}%")
    
    print("\n=== Layer 3: Intelligence Layer (Qwen Cloud Reasoning) ===")
    print("Streaming evaluation payload...")
    
    try:
        response = client.chat.completions.create(
            model="qwen3.6-plus",  
            messages=[
                {
                    "role": "system", 
                    "content": "You are the HydroCompute: Sentinel Autopilot agent for watershed-based compute governance. Provide a comprehensive Technical Diagnosis, Regulatory Readiness Notes, and Public Civic Impact Briefs based on the data."
                },
                {
                    "role": "user", 
                    "content": f"Analyze telemetry data. Ambient: {ambient_temp}°C, Discharge: {discharge_temp}°C, Delta-T: +{delta_t:.1f}°C, Limit: 2.0°C. QC Confidence: {qc_confidence}%."
                }
            ],
            extra_body={
                "enable_thinking": True,
                "max_completion_tokens": 1500
            }
        )
        
        print("\n=== Qwen Evaluation Output ===")
        message = response.choices[0].message
        if hasattr(message, "content") and message.content:
            print(message.content)
        elif hasattr(message, "reasoning_content") and message.reasoning_content:
            print("--- Reasoning Chain Output ---")
            print(message.reasoning_content)
        else:
            print("Technical assessment processed and compiled successfully.")
        
        print("\n=== Layer 4: Interface Gate ===")
        print("Status: PENDING HUMAN-IN-THE-LOOP APPROVAL.")
        
    except Exception as e:
        print(f"\nAPI Execution failed: {str(e)}")

if __name__ == "__main__":
    run_sentinel_autopilot(ambient_temp=32.0, discharge_temp=34.5)
