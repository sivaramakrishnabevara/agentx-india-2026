import React from 'react';
import { CheckCircle2, Bot, Brain, Wrench, Globe, Terminal, Sparkles } from 'lucide-react';

export default function About() {
  const capabilities = [
    { title: "Understanding Problems", desc: "Extract intent, analyze unstructured contexts, and formulate explicit objective functions." },
    { title: "Task Planning & Decomposition", desc: "Break down complex multi-step objectives into executable DAG execution graphs." },
    { title: "Tool Use & Function Calling", desc: "Dynamically select and execute Python code, REST APIs, databases, and CLI tools." },
    { title: "API Interoperability", desc: "Connect with third-party web services, cloud infrastructure, and enterprise data stores." },
    { title: "Information Processing", desc: "Process multimodal inputs including codebases, documents, images, and streaming audio." },
    { title: "Autonomous Decision Making", desc: "Evaluate intermediate step outputs, reason about failures, and re-plan dynamically." },
    { title: "Taking Meaningful Actions", desc: "Perform real-world actions like deploying code, triggering workflows, or sending alerts." },
    { title: "Producing Useful Outcomes", desc: "Deliver end-to-end completed tasks that eliminate manual human intervention." },
  ];

  return (
    <section id="about" className="section-padding" style={{ background: '#0b0f19', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="badge-tag">About The Hackathon</span>
          <h2 className="section-title">Beyond Basic Chatbots: <span className="gradient-text">True Agentic AI</span></h2>
          <p className="section-subtitle">
            AGENTX INDIA 2026 is an intensive 24-hour national hackathon where two-member teams build intelligent, tool-using AI agents that operate autonomously in complex environments.
          </p>
        </div>

        <div className="grid-2" style={{ alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
              Why Agentic AI Matters
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '20px', lineHeight: 1.7 }}>
              Standard Large Language Models (LLMs) are passive text predictors — they respond to prompts, but cannot act independently. 
              <strong>Agentic AI</strong> changes everything by giving LLMs perception, memory, tool access, and action loops.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '24px', lineHeight: 1.7 }}>
              In AGENTX INDIA 2026, your team will build AI agents that don't just chat, but actively solve real problems by querying databases, triggering web APIs, writing code, and orchestrating complex workflows.
            </p>
            
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', borderLeft: '4px solid #06b6d4', padding: '16px 20px', borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>The Hackathon Objective</div>
              <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0 }}>
                Build an agentic solution in 24 hours that demonstrates clear problem perception, multi-step tool execution, and measurable real-world impact.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot color="#06b6d4" /> Chatbot vs. Autonomous AI Agent
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>❌ Simple Chatbot</div>
                <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>• Passive text output</li>
                  <li>• No tool execution</li>
                  <li>• No memory or context</li>
                  <li>• Cannot call external APIs</li>
                  <li>• Requires constant human prompting</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>✓ Agentic AI System</div>
                <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>• Autonomous goal loop</li>
                  <li>• Function & tool calling</li>
                  <li>• Self-correction & re-planning</li>
                  <li>• Integrates with APIs & DBs</li>
                  <li>• Produces verified real outcomes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Capability Cards */}
        <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '32px' }}>
          What Your AI Agent Should Be Capable Of Doing:
        </h3>

        <div className="grid-3">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 color="#06b6d4" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>{cap.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>{cap.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
