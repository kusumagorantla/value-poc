import React, { useState, useEffect } from 'react';

interface SdlcPhase {
  phaseNumber: number;
  title: string;
  agentRole: string;
  agentPersona: string;
  model: string;
  gateStatus: 'APPROVED' | 'IN_REVIEW' | 'PENDING';
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachingHitRate: string;
  latencySec: number;
  costEstimate: string;
  agentReportTitle: string;
  generatedArtifactTitle: string;
}

export const AiSdlcOrchestrator: React.FC = () => {
  const [phases, setPhases] = useState<SdlcPhase[]>([]);
  const [activePhaseNum, setActivePhaseNum] = useState<number>(1);
  const [activeDocTab, setActivePhaseDocTab] = useState<'report' | 'artifact'>('report');
  const [docContent, setDocContent] = useState<string>('Loading live markdown artifact from server disk...');
  const [docPath, setDocPath] = useState<string>('');
  const [approving, setApproving] = useState<boolean>(false);

  // 1. Fetch live phases metadata from backend API
  const fetchPhases = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/ai-sdlc/phases');
      if (res.ok) {
        const data = await res.json();
        setPhases(data);
      }
    } catch (err) {
      console.error('Error fetching phases:', err);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const selectedPhase = phases.find(p => p.phaseNumber === activePhaseNum) || phases[0];

  // 2. Fetch live markdown file content dynamically from backend API
  useEffect(() => {
    if (!selectedPhase) return;

    const filename = activeDocTab === 'report' ? selectedPhase.agentReportTitle : selectedPhase.generatedArtifactTitle;
    
    fetch(`http://localhost:5000/api/v1/ai-sdlc/artifacts/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error(`Artifact ${filename} not found`);
        return res.json();
      })
      .then(data => {
        setDocContent(data.content);
        setDocPath(data.path);
      })
      .catch(err => {
        setDocContent(`⚠️ [Live Disk Reader]: Could not load artifact '${filename}' from server backend.\n\nError: ${err.message}`);
        setDocPath('');
      });
  }, [selectedPhase, activeDocTab]);

  // 3. Post human stage-gate approval live to backend API
  const handleApproveGate = async (phaseNum: number) => {
    setApproving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/ai-sdlc/gates/${phaseNum}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        await fetchPhases();
        if (data.nextUnlockedPhase) {
          setActivePhaseNum(data.nextUnlockedPhase);
        }
      }
    } catch (err) {
      console.error('Error approving stage gate:', err);
    } finally {
      setApproving(false);
    }
  };

  // 4. Reset workflow gates to Phase 1 for live demo re-testing
  const handleResetGates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/ai-sdlc/reset-gates', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchPhases();
        setActivePhaseNum(1);
      }
    } catch (err) {
      console.error('Error resetting workflow gates:', err);
    }
  };

  if (phases.length === 0) {
    return (
      <div style={{ padding: '24px', color: 'var(--ink)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
        ⏳ Loading live AI SDLC Orchestration data from backend API...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Bar */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>AI SDLC STAGE-GATE GOVERNANCE CONSOLE</h2>
            <div className="sub mono">
              Live Disk Artifact Streaming & Token Economics
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleResetGates} className="btn">
              🔄 Reset Gate Progression
            </button>
            <span className="pill p-ok mono" style={{ fontSize: '11.5px', padding: '5px 10px' }}>
              Total Cost: $0.370 USD | Caching: 81.2%
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Grid (6 Phases) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '8px' }}>
        {phases.map(p => {
          const isLocked = p.gateStatus === 'PENDING';
          return (
            <div
              key={p.phaseNumber}
              onClick={() => {
                if (isLocked) {
                  alert(`🔒 Phase 0${p.phaseNumber} is Locked! Please review Phase 0${p.phaseNumber - 1} first.`);
                  return;
                }
                setActivePhaseNum(p.phaseNumber);
              }}
              style={{
                backgroundColor: activePhaseNum === p.phaseNumber ? 'var(--accent-tint)' : 'var(--surface)',
                border: activePhaseNum === p.phaseNumber ? '2px solid var(--accent)' : '1px solid var(--rule)',
                borderRadius: '6px',
                padding: '10px 8px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.6 : 1,
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '2px' }}>
                <span className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-3)', flexShrink: 0 }}>P0{p.phaseNumber}</span>
                <span className={`pill ${p.gateStatus === 'APPROVED' ? 'p-ok' : p.gateStatus === 'IN_REVIEW' ? 'p-warn' : 'p-deg'} mono`} style={{ fontSize: '9.5px', padding: '1px 4px' }}>
                  {p.gateStatus === 'APPROVED' ? 'Approved ✅' : p.gateStatus === 'IN_REVIEW' ? 'In Review ⏳' : 'Locked 🔒'}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.title.split(': ')[1]}>
                {p.title.split(': ')[1]}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--ink-2)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.agentRole.split(' ')[0]} Agent
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px', alignItems: 'start' }}>
        {/* Left Column: Agent Card */}
        <div className="card">
          <div className="card-h">
            <h2>RESPONSIBLE AI AGENT EXECUTION CARD</h2>
            <span className="pill p-mute mono" style={{ marginLeft: 'auto' }}>
              {selectedPhase.model}
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>Role</span>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{selectedPhase.agentRole}</div>
              </div>
              <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>Persona</span>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{selectedPhase.agentPersona}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Token Economics & Metrics:
            </h4>
            <table style={{ marginBottom: '16px' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--ink-3)' }}>Prompt Tokens:</td>
                  <td className="num">{selectedPhase.promptTokens.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-3)' }}>Output Tokens:</td>
                  <td className="num">{selectedPhase.outputTokens.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-3)' }}>Total Tokens:</td>
                  <td className="num" style={{ color: 'var(--accent)', fontWeight: 600 }}>{selectedPhase.totalTokens.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-3)' }}>Caching Hit Rate:</td>
                  <td className="num" style={{ color: 'var(--ok)', fontWeight: 600 }}>{selectedPhase.cachingHitRate}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-3)' }}>Latency:</td>
                  <td className="num">{selectedPhase.latencySec}s</td>
                </tr>
              </tbody>
            </table>

            {/* Gate Action */}
            {selectedPhase.gateStatus === 'IN_REVIEW' ? (
              <button
                onClick={() => handleApproveGate(selectedPhase.phaseNumber)}
                disabled={approving}
                className="btn primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {approving ? 'Approving Stage Gate...' : `✅ Sign Off & Approve Phase 0${selectedPhase.phaseNumber}`}
              </button>
            ) : selectedPhase.gateStatus === 'APPROVED' ? (
              <div className="banner" style={{ justifyContent: 'center', backgroundColor: 'var(--ok-tint)', color: 'var(--ok)' }}>
                <strong>✅ Stage Gate Approved — Unlocked Next Phase</strong>
              </div>
            ) : (
              <div className="banner" style={{ justifyContent: 'center', backgroundColor: 'var(--surface-2)', color: 'var(--ink-3)' }}>
                <strong>🔒 Phase Locked</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Disk Artifact Streamer */}
        <div className="card">
          <div className="card-h">
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActivePhaseDocTab('report')}
                className="btn"
                style={{
                  backgroundColor: activeDocTab === 'report' ? 'var(--accent)' : 'transparent',
                  color: activeDocTab === 'report' ? '#FFFFFF' : 'var(--ink)'
                }}
              >
                📄 Agent Report
              </button>
              <button
                onClick={() => setActivePhaseDocTab('artifact')}
                className="btn"
                style={{
                  backgroundColor: activeDocTab === 'artifact' ? 'var(--accent)' : 'transparent',
                  color: activeDocTab === 'artifact' ? '#FFFFFF' : 'var(--ink)'
                }}
              >
                📦 Output Artifact
              </button>
            </div>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--ink-3)' }}>
              Disk Streamer
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            {docPath && (
              <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                File: {docPath}
              </div>
            )}

            <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--rule)', borderRadius: '5px', padding: '12px', height: '380px', overflowY: 'auto' }}>
              <pre className="mono" style={{ margin: 0, fontSize: '11px', color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {docContent}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
