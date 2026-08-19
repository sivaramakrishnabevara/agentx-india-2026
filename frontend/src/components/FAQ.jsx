import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FAQ() {
  const [faqs, setFaqs] = useState([
    {
      question: "What is AGENTX INDIA 2026?",
      answer: "AGENTX INDIA 2026 is a 24-hour national hackathon where two-member teams build autonomous, intelligent AI agents that solve real-world industry and social problems."
    },
    {
      question: "What is the registration fee?",
      answer: "The registration fee is ₹199 per team for 2 members."
    },
    {
      question: "How many members can be in a team?",
      answer: "Every team must consist of exactly 2 members. Individual or 3+ member registrations are not permitted."
    },
    {
      question: "Can I register alone?",
      answer: "No. AGENTX INDIA 2026 is strictly designed for 2-member teams to foster collaboration between developers, AI prompt engineers, and product builders."
    },
    {
      question: "What is the event duration and date?",
      answer: "The hackathon runs for 24 continuous hours on 30 August 2026."
    },
    {
      question: "What technologies can we use?",
      answer: "You can use any programming language, framework, or LLM API (e.g., OpenAI, Gemini, Claude, Llama, LangChain, AutoGen, CrewAI, custom Python agents) to build your agentic workflow."
    },
    {
      question: "What are the challenge tracks?",
      answer: "The five challenge tracks are: 1) AI for Education, 2) Career & Productivity, 3) AI Cybersecurity, 4) Sustainability, and 5) Smart Campus."
    },
    {
      question: "How does payment & verification work?",
      answer: "Pay ₹199 using the provided UPI QR code, enter your UTR / Transaction ID, and submit for verification. The organizer manually verifies the payment against bank statement, after which your status is marked CONFIRMED and your permanent Team ID (e.g., AX001) is assigned."
    },
    {
      question: "Can I get a refund?",
      answer: "Registration fee of ₹199 per team is non-refundable once paid, except in the event of hackathon cancellation by the organizers."
    },
    {
      question: "How will certificates be issued?",
      answer: "Digital certificates in high-resolution PNG and PDF formats will be generated for all eligible participating teams after project evaluation."
    },
    {
      question: "How can I verify my certificate?",
      answer: "Every certificate features a unique QR code. Anyone can scan the QR code or enter the Certificate ID on our public verification portal (/verify) to validate its authenticity."
    }
  ]);

  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    api.getFAQ()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) setFaqs(res);
      })
      .catch(err => console.log('FAQ load fallback', err));
  }, []);

  return (
    <section id="faq" className="section-padding" style={{ background: '#0b0f19', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="section-header">
          <span className="badge-tag">FAQ</span>
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="section-subtitle">
            Everything you need to know about team registration, payment, rules, and certificates.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={18} color="#06b6d4" style={{ flexShrink: 0 }} />
                  {faq.question}
                </h3>
                <ChevronDown 
                  size={20} 
                  color="#94a3b8" 
                  style={{
                    transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0
                  }} 
                />
              </div>

              {openIdx === idx && (
                <div style={{ padding: '0 24px 20px 54px', fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
