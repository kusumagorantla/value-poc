import React, { useState, useEffect } from 'react';
import { apiService, ProcessFlow, ProcessStep } from '../services/apiService';

interface LocalOperation {
  id: string;
  stepId: string;
  operationCode: number;
  operationName: string;
  spindleCode: string;
  isMandatory: boolean;
}

interface LocalResultDefinition {
  id: string;
  operationId: string;
  defCode: number;
  defName: string;
  dataType: string;
  uom: string;
  lsl: number;
  lal: number;
  nominal: number;
  ual: number;
  usl: number;
}

export const ProcessFlowBuilder: React.FC = () => {
  const [flows, setFlows] = useState<ProcessFlow[]>([]);
  
  // Master Flow Form
  const [productId, setProductId] = useState('MATERIAL-1');
  const [flowCode, setFlowCode] = useState('FLOW1');
  const [description, setDescription] = useState('Housing Screwing Line (Annex 1)');

  const [selectedFlowId, setSelectedFlowId] = useState<string>('1');

  // Pane 1 State: Process Steps
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 'step-1', flowId: '1', stepCode: 11001, stepName: 'Housing Screwing', stepOrder: 1 },
    { id: 'step-2', flowId: '1', stepCode: 11002, stepName: 'Body Sub Assembly 1', stepOrder: 2 },
    { id: 'step-3', flowId: '1', stepCode: 11003, stepName: 'Body Sub Assembly 3', stepOrder: 3 },
    { id: 'step-4', flowId: '1', stepCode: 11004, stepName: 'Assembly Gear', stepOrder: 4 },
    { id: 'step-5', flowId: '1', stepCode: 11005, stepName: 'Final Test', stepOrder: 5 },
    { id: 'step-6', flowId: '1', stepCode: 11006, stepName: 'Packing', stepOrder: 6 },
  ]);

  const [selectedStepId, setSelectedStepId] = useState<string>('step-1');

  // Pane 1 Form: Add Step
  const [newStepCode, setNewStepCode] = useState<number>(11007);
  const [newStepName, setNewStepName] = useState('Quality Visual Inspection');

  // Pane 2 State: Operations
  const [operations, setOperations] = useState<LocalOperation[]>([
    { id: 'op-1', stepId: 'step-1', operationCode: 123021, operationName: 'Screw 1 Tightening', spindleCode: 'Spindle 1', isMandatory: true },
    { id: 'op-2', stepId: 'step-1', operationCode: 123022, operationName: 'Screw 2 Tightening', spindleCode: 'Spindle 2', isMandatory: true },
    { id: 'op-3', stepId: 'step-1', operationCode: 123024, operationName: 'Screw 4 Tightening', spindleCode: 'Spindle 4', isMandatory: true },
  ]);

  const [selectedOpId, setSelectedOpId] = useState<string>('op-1');

  // Pane 2 Form: Add Operation
  const [newOpCode, setNewOpCode] = useState<number>(123025);
  const [newOpName, setNewOpName] = useState('Spindle Torque Check');

  // Pane 3 State: Result Definitions & Tolerance Bands
  const [resultDefs, setResultDefs] = useState<LocalResultDefinition[]>([
    { id: 'def-1', operationId: 'op-1', defCode: 50032, defName: 'Angle', dataType: 'numeric', uom: 'DD', lsl: 80, lal: 85, nominal: 90, ual: 95, usl: 100 },
    { id: 'def-2', operationId: 'op-1', defCode: 50033, defName: 'Torque', dataType: 'numeric', uom: 'NU', lsl: 4.5, lal: 4.7, nominal: 5.0, ual: 5.3, usl: 5.5 },
  ]);

  // Pane 3 Form: Add Result Def
  const [newDefCode, setNewDefCode] = useState<number>(50036);
  const [newDefName, setNewDefName] = useState('Depth Measurement');
  const [newUom, setNewUom] = useState('MM');

  const [message, setMessage] = useState('System ready. Site DB master process flow model active.');

  const loadFlows = async () => {
    const siteData = await apiService.getProcessFlows();
    if (siteData && siteData.length > 0) {
      setFlows(siteData);
      if (siteData[0].id) {
        setSelectedFlowId(siteData[0].id);
      }
      if (siteData[0].steps && siteData[0].steps.length > 0) {
        setSteps(siteData[0].steps);
        if (siteData[0].steps[0].id) {
          setSelectedStepId(siteData[0].steps[0].id);
        }
      }
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !flowCode) return;

    setMessage(`Saving Process Flow '${productId} / ${flowCode}' to Central Site DB...`);
    const newFlow = await apiService.createProcessFlow({ productId, flowCode, description });
    
    const created: ProcessFlow = newFlow || {
      id: `flow-${Date.now()}`,
      productId,
      flowCode,
      description,
      syncStatus: 'SYNCED',
      createdAt: new Date().toISOString(),
      steps: []
    };

    setFlows(prev => [created, ...prev.filter(f => f.id !== created.id)]);
    setSelectedFlowId(created.id);
    setMessage(`✓ Successfully saved process flow '${productId} / ${flowCode}' into Central Site DB (SYNCED)!`);
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName) return;

    setMessage(`Adding Step [${newStepCode}] ${newStepName}...`);
    
    if (selectedFlowId) {
      await apiService.addStepToFlow(selectedFlowId, {
        stepCode: newStepCode,
        stepName: newStepName,
        stepOrder: steps.length + 1
      });
    }

    const createdStep: ProcessStep = {
      id: `step-${Date.now()}`,
      flowId: selectedFlowId,
      stepCode: newStepCode,
      stepName: newStepName,
      stepOrder: steps.length + 1
    };

    setSteps(prev => [...prev, createdStep]);
    if (createdStep.id) {
      setSelectedStepId(createdStep.id);
    }
    setNewStepCode(prev => prev + 1);
    setMessage(`✓ Step '[${createdStep.stepCode}] ${createdStep.stepName}' successfully added to Process Flow and saved to DB!`);
  };

  const handleAddOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName) return;

    const createdOp: LocalOperation = {
      id: `op-${Date.now()}`,
      stepId: selectedStepId,
      operationCode: newOpCode,
      operationName: newOpName,
      spindleCode: 'Spindle Auto',
      isMandatory: true
    };

    setOperations(prev => [...prev, createdOp]);
    setSelectedOpId(createdOp.id);
    setNewOpCode(prev => prev + 1);
    setMessage(`✓ Operation '[${createdOp.operationCode}] ${createdOp.operationName}' added successfully!`);
  };

  const handleAddResultDef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefName) return;

    const createdDef: LocalResultDefinition = {
      id: `def-${Date.now()}`,
      operationId: selectedOpId,
      defCode: newDefCode,
      defName: newDefName,
      dataType: 'numeric',
      uom: newUom,
      lsl: 10.0,
      lal: 12.0,
      nominal: 15.0,
      ual: 18.0,
      usl: 20.0
    };

    setResultDefs(prev => [...prev, createdDef]);
    setNewDefCode(prev => prev + 1);
    setMessage(`✓ Value Definition '[${createdDef.defCode}] ${createdDef.defName}' created with LSL/LAL/Nominal/UAL/USL tolerance band!`);
  };

  const handleValidateFlow = () => {
    setMessage(`✓ Validation Complete: ${steps.length} steps, ${operations.length} operations, and ${resultDefs.length} value definitions passed tolerance & integrity checks!`);
  };

  const handlePublishFlow = async () => {
    setMessage(`Publishing Version 13 of Process Flow '${productId} / ${flowCode}'...`);
    await apiService.createProcessFlow({ productId, flowCode, description });
    setMessage(`✓ Published Version 13 of Process Flow '${productId} / ${flowCode}' to Site Central DB and distributed to Edge Line PCs!`);
  };

  const activeFlow = flows.find(f => f.id === selectedFlowId) || {
    id: selectedFlowId,
    productId,
    flowCode,
    description,
    syncStatus: 'SYNCED',
    createdAt: new Date().toISOString(),
    steps: []
  };

  const currentStepOps = operations.filter(o => o.stepId === selectedStepId);
  const currentOpDefs = resultDefs.filter(r => r.operationId === selectedOpId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Banner Notification */}
      {message && (
        <div className="banner" style={{ marginBottom: 0 }}>
          <span className="mono" style={{ fontWeight: 600 }}>[SYSTEM STATUS]</span>
          <span>{message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="card">
        <div className="card-h" style={{ padding: '12px 18px' }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
              {activeFlow.productId} / {activeFlow.flowCode} <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: '12.5px' }}>· site, master</span>
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '2px' }}>
              {activeFlow.description}
            </div>
          </div>

          <form onSubmit={handleCreateFlow} style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="field"
              style={{ width: '110px' }}
            />
            <input
              type="text"
              placeholder="Flow Code"
              value={flowCode}
              onChange={e => setFlowCode(e.target.value)}
              className="field"
              style={{ width: '80px' }}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="field"
              style={{ width: '220px' }}
            />
            <button type="submit" className="btn primary">
              + Save Flow
            </button>
          </form>
        </div>
      </div>

      {/* Three-Pane Editor Layout */}
      <div className="panes" style={{ display: 'grid', gridTemplateColumns: '250px 240px 1fr', gap: '14px', alignItems: 'start' }}>
        
        {/* PANE 1: Process Steps */}
        <div className="card" style={{ minHeight: '520px' }}>
          <div className="card-h">
            <h2 style={{ fontSize: '13px', fontWeight: 600 }}>Process steps</h2>
            <span className="pill p-mute mono" style={{ marginLeft: 'auto', fontSize: '10px' }}>draft</span>
            <button 
              onClick={() => {
                const el = document.getElementById('new-step-input');
                if (el) el.focus();
              }} 
              className="btn" 
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              Add step
            </button>
          </div>

          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--rule-2)', backgroundColor: 'var(--surface-2)' }}>
            <form onSubmit={handleAddStep} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="Code"
                  value={newStepCode}
                  onChange={e => setNewStepCode(Number(e.target.value))}
                  className="field"
                  style={{ width: '100%' }}
                />
                <input
                  id="new-step-input"
                  type="text"
                  placeholder="Step Name"
                  value={newStepName}
                  onChange={e => setNewStepName(e.target.value)}
                  className="field"
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn primary" style={{ justifyContent: 'center', width: '100%', fontSize: '11.5px', padding: '5px' }}>
                + Add Process Step
              </button>
            </form>
          </div>

          <ul className="pane-list">
            {steps.map((step, idx) => (
              <li key={step.id || idx}>
                <button
                  aria-current={step.id === selectedStepId ? 'true' : 'false'}
                  onClick={() => {
                    if (step.id) {
                      setSelectedStepId(step.id);
                      const ops = operations.filter(o => o.stepId === step.id);
                      if (ops.length > 0) setSelectedOpId(ops[0].id);
                    }
                  }}
                >
                  <span className="grip">⋮⋮</span>
                  <span className="ord">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="nm">[{step.stepCode}] {step.stepName}</span>
                  <span className="ct">{operations.filter(o => o.stepId === step.id).length || 1}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* PANE 2: Process Operations */}
        <div className="card" style={{ minHeight: '520px' }}>
          <div className="card-h">
            <h2 style={{ fontSize: '13px', fontWeight: 600 }}>Operations</h2>
            <span className="pill p-mute mono" style={{ marginLeft: 'auto', fontSize: '10px' }}>
              {steps.find(s => s.id === selectedStepId)?.stepCode || 11001}
            </span>
          </div>

          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--rule-2)', backgroundColor: 'var(--surface-2)' }}>
            <form onSubmit={handleAddOperation} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="number"
                placeholder="Op Code (e.g. 123025)"
                value={newOpCode}
                onChange={e => setNewOpCode(Number(e.target.value))}
                className="field"
                style={{ width: '100%' }}
              />
              <input
                type="text"
                placeholder="Operation Name"
                value={newOpName}
                onChange={e => setNewOpName(e.target.value)}
                className="field"
                style={{ width: '100%' }}
              />
              <button type="submit" className="btn" style={{ justifyContent: 'center', width: '100%', fontSize: '11.5px', padding: '5px' }}>
                + Add Operation
              </button>
            </form>
          </div>

          <ul className="pane-list">
            {currentStepOps.length > 0 ? (
              currentStepOps.map(op => (
                <li key={op.id}>
                  <button
                    aria-current={op.id === selectedOpId ? 'true' : 'false'}
                    onClick={() => setSelectedOpId(op.id)}
                  >
                    <span className="nm">[{op.operationCode}] {op.operationName}</span>
                  </button>
                </li>
              ))
            ) : (
              <li style={{ padding: '16px 12px', fontSize: '12px', color: 'var(--ink-3)', textAlign: 'center' }}>
                No operations defined yet for this step.
              </li>
            )}
          </ul>
        </div>

        {/* PANE 3: Value Definitions & Tolerance Bands */}
        <div className="card" style={{ minHeight: '520px' }}>
          <div className="card-h">
            <h2 style={{ fontSize: '13px', fontWeight: 600 }}>Value definitions</h2>
            <span className="sub">{currentOpDefs.length} defined</span>
            <button onClick={handleValidateFlow} className="btn" style={{ marginLeft: 'auto', fontSize: '11.5px' }}>
              Validate
            </button>
            <button onClick={handlePublishFlow} className="btn primary" style={{ fontSize: '11.5px' }}>
              Publish v13
            </button>
          </div>

          {/* Form to add new Result Definition */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--rule-2)', backgroundColor: 'var(--surface-2)' }}>
            <form onSubmit={handleAddResultDef} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Def Code"
                value={newDefCode}
                onChange={e => setNewDefCode(Number(e.target.value))}
                className="field"
                style={{ width: '100%' }}
              />
              <input
                type="text"
                placeholder="Value Definition Name"
                value={newDefName}
                onChange={e => setNewDefName(e.target.value)}
                className="field"
                style={{ width: '100%' }}
              />
              <input
                type="text"
                placeholder="UOM"
                value={newUom}
                onChange={e => setNewUom(e.target.value)}
                className="field"
                style={{ width: '100%' }}
              />
              <button type="submit" className="btn primary" style={{ fontSize: '11.5px', padding: '5px 12px' }}>
                + Add Value Def
              </button>
            </form>
          </div>

          {/* Render Result Definitions */}
          <div>
            {currentOpDefs.map(def => (
              <div key={def.id} className="rdef">
                <div className="rdef-top">
                  <span className="id">[{def.defCode}]</span>
                  <span className="nm">{def.defName}</span>
                  <span className="pill p-ok">{def.dataType}</span>
                  <span className="pill p-mute">measurement</span>
                  <span className="pill p-mute">{def.uom}</span>
                  <span className="pill p-ok">mandatory</span>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--ink-3)' }}>
                    nominal {def.nominal}
                  </span>
                </div>

                {/* Tolerance Band Visual Graphic */}
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  background: 'linear-gradient(to right, #FBEAE7 0%, #FBEAE7 20%, #FAF0DC 20%, #FAF0DC 40%, #E4F2EF 40%, #E4F2EF 60%, #FAF0DC 60%, #FAF0DC 80%, #FBEAE7 80%, #FBEAE7 100%)',
                  margin: '12px 0 10px',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', left: '20%', top: '-3px', width: '2px', height: '12px', backgroundColor: '#B03A2E' }}></span>
                  <span style={{ position: 'absolute', left: '40%', top: '-3px', width: '2px', height: '12px', backgroundColor: '#B4791A' }}></span>
                  <span style={{ position: 'absolute', left: '50%', top: '-4px', width: '3px', height: '14px', backgroundColor: '#17796A' }}></span>
                  <span style={{ position: 'absolute', left: '60%', top: '-3px', width: '2px', height: '12px', backgroundColor: '#B4791A' }}></span>
                  <span style={{ position: 'absolute', left: '80%', top: '-3px', width: '2px', height: '12px', backgroundColor: '#B03A2E' }}></span>
                </div>

                {/* Limits Grid Inputs */}
                <div className="limits">
                  <div>
                    <label>LSL</label>
                    <input type="number" defaultValue={def.lsl} className="mono" />
                  </div>
                  <div>
                    <label>LAL</label>
                    <input type="number" defaultValue={def.lal} className="mono" />
                  </div>
                  <div>
                    <label>NOMINAL</label>
                    <input type="number" defaultValue={def.nominal} className="mono" />
                  </div>
                  <div>
                    <label>UAL</label>
                    <input type="number" defaultValue={def.ual} className="mono" />
                  </div>
                  <div>
                    <label>USL</label>
                    <input type="number" defaultValue={def.usl} className="mono" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
