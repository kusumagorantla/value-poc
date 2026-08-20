import React, { useState } from 'react';
import { AiSdlcOrchestrator } from './components/AiSdlcOrchestrator';
import { ProcessFlowBuilder } from './components/ProcessFlowBuilder';
import { EdgeConsole } from './components/EdgeConsole';
import { PlcSimulator } from './components/PlcSimulator';
import { GrafanaDashboard } from './components/GrafanaDashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'ai-sdlc' | 'site-admin' | 'edge-console' | 'plc-simulator' | 'grafana'>('site-admin');
  const [activeEnvMode, setActiveEnvMode] = useState<'SITE' | 'EDGE'>('SITE');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--rail) 1fr', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar Navigation Rail (#2D3E7B) */}
      <div style={{
        backgroundColor: 'var(--accent)',
        color: '#FFFFFF',
        padding: '0 0 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Brand Header with Valeo Logo Accent */}
        <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Valeo Brand Icon */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#00A859', // Valeo Signature Green
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '15px',
            color: '#FFFFFF',
            fontFamily: 'sans-serif'
          }}>
            V
          </div>
          <div>
            <b style={{ display: 'block', fontSize: '13.5px', letterSpacing: '0.02em', fontWeight: 600 }}>
              JARVIS Traceability
            </b>
            <span style={{
              display: 'block',
              fontSize: '10.5px',
              color: 'rgba(255,255,255,0.65)',
              marginTop: '1px',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.03em'
            }}>
              VALEO MOM · RECORDING
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => { setActiveTab('site-admin'); setActiveEnvMode('SITE'); }}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 11px',
              borderRadius: '5px',
              fontSize: '13px',
              color: activeTab === 'site-admin' ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
              backgroundColor: activeTab === 'site-admin' ? 'rgba(255,255,255,0.16)' : 'transparent',
              fontWeight: activeTab === 'site-admin' ? 600 : 400,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', width: '14px' }}>01</span>
            <span>Site Admin Console</span>
          </button>

          <button
            onClick={() => { setActiveTab('edge-console'); setActiveEnvMode('EDGE'); }}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 11px',
              borderRadius: '5px',
              fontSize: '13px',
              color: activeTab === 'edge-console' ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
              backgroundColor: activeTab === 'edge-console' ? 'rgba(255,255,255,0.16)' : 'transparent',
              fontWeight: activeTab === 'edge-console' ? 600 : 400,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', width: '14px' }}>02</span>
            <span>Edge PC Line Console</span>
          </button>

          <button
            onClick={() => setActiveTab('grafana')}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 11px',
              borderRadius: '5px',
              fontSize: '13px',
              color: activeTab === 'grafana' ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
              backgroundColor: activeTab === 'grafana' ? 'rgba(255,255,255,0.16)' : 'transparent',
              fontWeight: activeTab === 'grafana' ? 600 : 400,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', width: '14px' }}>03</span>
            <span>Grafana Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('plc-simulator')}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 11px',
              borderRadius: '5px',
              fontSize: '13px',
              color: activeTab === 'plc-simulator' ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
              backgroundColor: activeTab === 'plc-simulator' ? 'rgba(255,255,255,0.16)' : 'transparent',
              fontWeight: activeTab === 'plc-simulator' ? 600 : 400,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', width: '14px' }}>04</span>
            <span>PLC Simulator (BUC-1)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-sdlc')}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 11px',
              borderRadius: '5px',
              fontSize: '13px',
              color: activeTab === 'ai-sdlc' ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
              backgroundColor: activeTab === 'ai-sdlc' ? 'rgba(255,255,255,0.16)' : 'transparent',
              fontWeight: activeTab === 'ai-sdlc' ? 600 : 400,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', width: '14px' }}>05</span>
            <span>AI SDLC Governance</span>
          </button>
        </div>

        {/* Rail Footer */}
        <div style={{
          marginTop: 'auto',
          padding: '0 18px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'IBM Plex Mono', monospace",
          lineHeight: 1.7
        }}>
          <div>role {activeEnvMode.toLowerCase()}</div>
          <div>model v12</div>
          <div>build 0.1.0-poc</div>
        </div>
      </div>

      {/* Main Workspace Right Container */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <div style={{
          height: 'var(--head)',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '0 22px',
          position: 'sticky',
          top: 0,
          zIndex: 5
        }}>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', margin: 0, color: 'var(--ink)' }}>
              Flow Editor <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>/ {activeTab === 'site-admin' ? 'Site Central' : activeTab === 'edge-console' ? 'Edge PC Line Modeler' : activeTab === 'grafana' ? 'Grafana Traceability Dashboard' : activeTab === 'plc-simulator' ? 'PLC Cycle Simulator' : 'AI SDLC Governance'}</span>
            </h1>
            <div style={{ fontSize: '11.5px', color: 'var(--ink-3)', fontFamily: "'IBM Plex Mono', monospace", marginTop: '1px' }}>
              Material Ref: <strong style={{ color: 'var(--accent)' }}>MATERIAL-1</strong> · Flow Code: <strong style={{ color: 'var(--accent)' }}>FLOW1</strong>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* ENV Toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--rule)', borderRadius: '5px', overflow: 'hidden' }}>
              <button
                onClick={() => { setActiveEnvMode('SITE'); setActiveTab('site-admin'); }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '5px 13px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: activeEnvMode === 'SITE' ? '#FFFFFF' : 'var(--ink-2)',
                  backgroundColor: activeEnvMode === 'SITE' ? 'var(--accent)' : 'transparent'
                }}
              >
                SITE
              </button>
              <button
                onClick={() => { setActiveEnvMode('EDGE'); setActiveTab('edge-console'); }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '5px 13px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: activeEnvMode === 'EDGE' ? '#FFFFFF' : 'var(--ink-2)',
                  backgroundColor: activeEnvMode === 'EDGE' ? 'var(--accent)' : 'transparent'
                }}
              >
                EDGE
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-2)', fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00A859' }}></span>
              valeo.admin
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '22px', flex: 1 }}>
          {activeTab === 'site-admin' && <ProcessFlowBuilder />}
          {activeTab === 'edge-console' && <EdgeConsole />}
          {activeTab === 'grafana' && <GrafanaDashboard />}
          {activeTab === 'plc-simulator' && <PlcSimulator />}
          {activeTab === 'ai-sdlc' && <AiSdlcOrchestrator />}
        </div>
      </div>
    </div>
  );
}

export default App;
