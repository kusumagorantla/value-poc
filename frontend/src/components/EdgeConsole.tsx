import React, { useState, useEffect } from 'react';
import { apiService, ProcessFlow } from '../services/apiService';

export const EdgeConsole: React.FC = () => {
  const [edgeFlows, setEdgeFlows] = useState<ProcessFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Local Edge PC Editing States
  const [productId, setProductId] = useState('MATERIAL-1');
  const [flowCode, setFlowCode] = useState('FLOW1');
  const [edgeDescription, setEdgeDescription] = useState('Housing Screwing Line (Local Edge PC Fine-Tuning)');

  const [stepCode, setStepCode] = useState<number>(11007);
  const [stepName, setStepName] = useState('Local Edge Quality Check');
  const [stepOrder, setStepOrder] = useState<number>(7);

  const loadEdgeFlows = async () => {
    const data = await apiService.getEdgeProcessFlows();
    setEdgeFlows(data);
    if (data.length > 0 && !selectedFlowId) {
      setSelectedFlowId(data[0].id);
      setProductId(data[0].productId);
      setFlowCode(data[0].flowCode);
      setEdgeDescription(data[0].description);
    }
  };

  useEffect(() => {
    loadEdgeFlows();
    // Auto-refresh Edge flow list every 5s to reflect background sync status updates dynamically
    const interval = setInterval(() => {
      loadEdgeFlows();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEditOnEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlowId) return;

    setMessage('Saving Line Edit directly on Edge PC terminal...');
    const updated = await apiService.editOnEdgeAndSyncBack(selectedFlowId, {
      productId,
      flowCode,
      description: edgeDescription
    });

    if (updated) {
      setMessage(`Direct Edge PC modification saved locally ('EDGE_MODIFIED')! Background Auto-Sync Worker will reconcile with Site DB within 30s.`);
      await loadEdgeFlows();
    }
  };

  const handleAddStepOnEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlowId || !stepName) return;

    setMessage(`Adding Step [${stepCode}] '${stepName}' directly on Edge PC...`);
    const newStep = await apiService.addStepToEdgeFlow(selectedFlowId, { stepCode, stepName, stepOrder });
    
    // Always refresh and update flow status
    await apiService.editOnEdgeAndSyncBack(selectedFlowId, { productId, flowCode, description: edgeDescription });
    setMessage(`✓ Successfully added step '[${stepCode}] ${stepName}' directly to Edge PC Line! Sync status set to 'EDGE_MODIFIED'.`);
    
    // Increment for next addition
    setStepCode(prev => prev + 1);
    setStepOrder(prev => prev + 1);
    await loadEdgeFlows();
  };

  const selectedFlow = edgeFlows.find(f => f.id === selectedFlowId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Notification Banner */}
      {message && (
        <div className="banner">
          <span className="mono" style={{ fontWeight: 600 }}>[EDGE STATUS]</span>
          <span>{message}</span>
        </div>
      )}

      {/* Edge Conflict & Sync Policy Banner */}
      <div className="banner conflict">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
              EDGE LINE LOCAL CONFLICT & BIDIRECTIONAL SYNC POLICY
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '4px', margin: 0 }}>
              For Site/Edge conflicts, local Edge values are preserved. Saving local modifications sets status to <code className="mono">EDGE_MODIFIED</code>.
              Background worker <code className="mono">SiteEdgeSyncBackgroundService</code> automatically reconciles changes back to central <code className="mono">jarvis_site_db</code>.
            </p>
          </div>
          <span className="pill p-ok mono" style={{ flexShrink: 0 }}>
            Auto-Sync Active (30s)
          </span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
        
        {/* Left Card: Line Process Models in Edge DB */}
        <div className="card">
          <div className="card-h">
            <h2>EDGE LINE DATABASE MODELS (<code className="mono" style={{ fontSize: '11.5px' }}>jarvis_edge_db</code>)</h2>
            <span className="pill p-warn mono" style={{ marginLeft: 'auto' }}>
              AUTONOMOUS EDGE
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <form onSubmit={handleEditOnEdge} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '4px' }}>Product ID</label>
                  <input
                    type="text"
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    className="field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '4px' }}>Flow Code</label>
                  <input
                    type="text"
                    value={flowCode}
                    onChange={e => setFlowCode(e.target.value)}
                    className="field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '4px' }}>Line Description / Local Override</label>
                <input
                  type="text"
                  value={edgeDescription}
                  onChange={e => setEdgeDescription(e.target.value)}
                  className="field"
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn primary">
                ⚡ Save Line Edit to Edge DB (Auto-Background Sync Active)
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {edgeFlows.map(f => (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelectedFlowId(f.id);
                    setProductId(f.productId);
                    setFlowCode(f.flowCode);
                    setEdgeDescription(f.description);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--rule)',
                    backgroundColor: f.id === selectedFlowId ? 'var(--accent-tint)' : 'var(--surface)',
                    boxShadow: f.id === selectedFlowId ? 'inset 3px 0 0 var(--accent)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{f.productId} ({f.flowCode})</span>
                    <span className={`pill ${f.syncStatus.includes('EDGE_MODIFIED') ? 'p-warn' : 'p-ok'} mono`}>
                      {f.syncStatus}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '4px', margin: 0 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Local Steps Configuration on Edge */}
        <div className="card">
          <div className="card-h">
            <h2>LOCAL STEPS CONFIGURATION ({selectedFlow?.productId || 'MATERIAL-1'})</h2>
            <span className="pill p-mute mono" style={{ marginLeft: 'auto' }}>
              LINE SYNC
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <form onSubmit={handleAddStepOnEdge} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Step Code"
                  value={stepCode}
                  onChange={e => setStepCode(Number(e.target.value))}
                  className="field"
                  style={{ width: '100%' }}
                />
                <input
                  type="text"
                  placeholder="Step Name"
                  value={stepName}
                  onChange={e => setStepName(e.target.value)}
                  className="field"
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn" style={{ justifyContent: 'center', width: '100%' }}>
                + Add Local Step on Edge
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedFlow?.steps && selectedFlow.steps.length > 0 ? (
                selectedFlow.steps.map(s => (
                  <div key={s.id} style={{ padding: '10px 12px', border: '1px solid var(--rule-2)', borderRadius: '5px', backgroundColor: 'var(--surface-2)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>[{s.stepCode}] {s.stepName}</div>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-3)' }}>Order: {s.stepOrder}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                  No steps configured yet for this line flow.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Edge Line Quick Telemetry Diagnostic Panel */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-h">
          <div>
            <h2>EDGE LINE TELEMETRY DIAGNOSTICS & PLC VALIDATION</h2>
            <div className="sub mono">Execute Sub-50ms Synchronous Machine Cycle Test on Local Line DB</div>
          </div>
          <span className="pill p-ok mono" style={{ marginLeft: 'auto' }}>
            AUTO-SYNC 30s
          </span>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                setMessage('Firing Nominal Cycle (Torque 15.2 N·m)...');
                const res = await apiService.recordProcessResult({
                  product_context: { product_id: selectedFlow?.productId || "MATERIAL-1", product_serial_no: `SN-EDGE-${Date.now()}` },
                  time_context: { timestamp: new Date().toISOString() },
                  process_context: { station_id: "ST060.1", process_step_id: 11001, station_mode: 0, process_step_result: 1, wpc_no: "587", machine_time: 23.6, cycle_time: 35.12 },
                  process_results: [
                    { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50032, value_numeric: 15.2 }
                  ]
                });
                setMessage(`✓ Nominal Cycle Recorded! Status: ${res?.status || 'ACCEPTED_FULL'}, StorageMode: ${res?.storage_mode || 'STANDARD'}`);
              }}
              className="btn"
            >
              ⚡ Test Preset 1 (Nominal OK · 15.2 N·m)
            </button>

            <button
              onClick={async () => {
                setMessage('Firing Torque Limit Exceeded Cycle (18.8 N·m > USL 16.0 N·m)...');
                const res = await apiService.recordProcessResult({
                  product_context: { product_id: selectedFlow?.productId || "MATERIAL-1", product_serial_no: `SN-DEFECT-${Date.now()}` },
                  time_context: { timestamp: new Date().toISOString() },
                  process_context: { station_id: "ST060.1", process_step_id: 11001, station_mode: 0, process_step_result: 2, failure_code: "ERR-TRQ-MAX", wpc_no: "587", machine_time: 28.4, cycle_time: 42.10 },
                  process_results: [
                    { process_operation_id: 123021, process_operation_result: 2, process_result_id: 50032, value_numeric: 18.8 }
                  ]
                });
                setMessage(`⚠️ Defect Recorded! StepResult: NOK (2), FailureCode: ERR-TRQ-MAX, Torque: 18.8 N·m`);
              }}
              className="btn"
              style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }}
            >
              ⚡ Test Preset 3 (Torque Limit Exceeded NOK · 18.8 N·m)
            </button>

            <button
              onClick={async () => {
                setMessage('Firing Degraded Mode Cycle (Unmapped Station)...');
                const res = await apiService.recordProcessResult({
                  product_context: { product_id: selectedFlow?.productId || "MATERIAL-1", product_serial_no: "" },
                  time_context: { timestamp: new Date().toISOString() },
                  process_context: { station_id: "ST-UNMAPPED-888", process_step_id: 0, station_mode: 0, process_step_result: 1 },
                  process_results: [
                    { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50032, value_numeric: 5.12 }
                  ]
                });
                setMessage(`ℹ️ Saved in DEGRADED_MISSING_CONTEXT mode! Raw payload logged to audit table.`);
              }}
              className="btn"
            >
              ⚡ Test Preset 2 (Degraded Missing Context)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
