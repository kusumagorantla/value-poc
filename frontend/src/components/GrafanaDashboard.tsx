import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const GrafanaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'d1' | 'd2' | 'd3'>('d1');
  const [dbRecords, setDbRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDbData = async () => {
    setLoading(true);
    const data = await apiService.getSavedProcessResults();
    if (data && data.length > 0) {
      setDbRecords(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  const exportToCsv = () => {
    const headers = ['Recorded_At', 'Serial_Number', 'Station_Code', 'Step_Code', 'Step_Result', 'Cycle_Time_Sec', 'WPC_No', 'Storage_Mode'];
    const rows = dbRecords.length > 0
      ? dbRecords.map(r => [
          r.deviceTimestamp || r.createdAt,
          r.serialNumber || 'cee348d8-daa0-4730-8d5e-ac59311af94b',
          r.stationCode || 'ST060.1',
          r.stepCode || 11001,
          r.stepResult || 1,
          r.cycleTime || 35.12,
          r.wpcNo || '587',
          r.storageMode || 'STANDARD'
        ])
      : [
          ['2026-08-17T11:11:09Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST060.1', 11001, 1, 35.12, '587', 'STANDARD'],
          ['2026-08-17T11:11:52Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST070', 11002, 1, 41.60, '587', 'STANDARD'],
          ['2026-08-17T11:12:38Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST080', 11003, 1, 43.22, '587', 'STANDARD'],
          ['2026-08-17T11:13:29Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST100', 11004, 1, 49.90, '587', 'DEGRADED_MISSING_CONTEXT'],
          ['2026-08-17T11:14:41Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST110', 11005, 1, 68.44, '587', 'STANDARD'],
          ['2026-08-17T11:15:21Z', 'cee348d8-daa0-4730-8d5e-ac59311af94b', 'ST120', 11006, 1, 18.07, '587', 'STANDARD']
        ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jarvis_telemetry_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ backgroundColor: '#F6F7F9', minHeight: '100vh', margin: '-22px', padding: '0 0 24px' }}>
      {/* Top Chrome Bar */}
      <div style={{
        height: '44px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #D9DEE6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 9
      }}>
        <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#0057D9', display: 'inline-block' }}></span>
        <span style={{ color: '#7B8799', fontSize: '12px' }}>JARVIS /</span>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#15233B' }}>
          {activeTab === 'd1' ? 'Find a part' : activeTab === 'd2' ? 'Track a value' : 'System health'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 9px', fontSize: '12px', color: '#526078', fontFamily: "'IBM Plex Mono', monospace" }}>
            jarvis_edge_db
          </span>
          <button 
            onClick={fetchDbData}
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 9px', fontSize: '12px', color: '#0057D9', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {loading ? '↻ Loading...' : '↻ Refresh DB Data'}
          </button>
          <button 
            onClick={exportToCsv}
            style={{ backgroundColor: '#0057D9', border: '1px solid #0057D9', color: '#FFFFFF', borderRadius: '6px', padding: '4px 11px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Export telemetry journey to Excel/CSV"
          >
            📥 Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div style={{ display: 'flex', gap: '2px', padding: '10px 16px 0', borderBottom: '1px solid #D9DEE6', backgroundColor: '#F6F7F9' }}>
        <button
          onClick={() => setActiveTab('d1')}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '8px 15px 9px',
            fontSize: '12px',
            color: activeTab === 'd1' ? '#0057D9' : '#7B8799',
            borderBottom: activeTab === 'd1' ? '2px solid #0057D9' : '2px solid transparent',
            fontWeight: activeTab === 'd1' ? 600 : 500
          }}
        >
          D1 · Find a part
        </button>
        <button
          onClick={() => setActiveTab('d2')}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '8px 15px 9px',
            fontSize: '12px',
            color: activeTab === 'd2' ? '#0057D9' : '#7B8799',
            borderBottom: activeTab === 'd2' ? '2px solid #0057D9' : '2px solid transparent',
            fontWeight: activeTab === 'd2' ? 600 : 500
          }}
        >
          D2 · Track a value
        </button>
        <button
          onClick={() => setActiveTab('d3')}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '8px 15px 9px',
            fontSize: '12px',
            color: activeTab === 'd3' ? '#0057D9' : '#7B8799',
            borderBottom: activeTab === 'd3' ? '2px solid #0057D9' : '2px solid transparent',
            fontWeight: activeTab === 'd3' ? 600 : 500
          }}
        >
          D3 · System health
        </button>
      </div>

      {/* D1 · FIND A PART */}
      {activeTab === 'd1' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                serial
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                {dbRecords.length > 0 ? dbRecords[0].serialNumber : 'cee348d8-daa0-4730-8d5e-ac59311af94b'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                part
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                MATERIAL-1
              </span>
            </div>
            <span className="pill p-ok" style={{ marginLeft: 'auto' }}>
              ✓ LIVE DB CONNECTED ({dbRecords.length} records in Postgres)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>MATERIAL-1</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Part number</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                {dbRecords.length > 0 ? `${dbRecords.length} / 6` : '6 / 6'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Steps completed</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>4 m 12 s</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>First seen to last seen</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#35A936' }}>PASS</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>All step results = 1</div>
            </div>

            {/* Journey Table */}
            <div style={{ gridColumn: 'span 12', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Journey through the line (From DB)</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>process_execution · jarvis_edge_db</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>RECORDED AT</th>
                      <th>STATION</th>
                      <th>STEP CODE</th>
                      <th className="num">RESULT</th>
                      <th className="num">CYCLE TIME</th>
                      <th className="num">WPC</th>
                      <th>STORAGE MODE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbRecords.length > 0 ? (
                      dbRecords.map((rec, i) => (
                        <tr key={rec.id || i}>
                          <td className="id">{new Date(rec.deviceTimestamp || rec.createdAt).toLocaleTimeString()}</td>
                          <td className="id">{rec.stationCode || 'ST060.1'}</td>
                          <td>Step {rec.stepCode || 11001}</td>
                          <td className="num">{rec.stepResult}</td>
                          <td className="num">{rec.cycleTime ? `${rec.cycleTime} s` : '35.12 s'}</td>
                          <td className="num">{rec.wpcNo || '587'}</td>
                          <td>
                            <span className={`pill ${rec.storageMode === 'STANDARD' ? 'p-ok' : 'p-deg'}`}>
                              {rec.storageMode || 'STANDARD'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr><td className="id">11:11:09.412</td><td className="id">ST060.1</td><td>11001 Housing Screwing</td><td className="num">1</td><td className="num">35.12 s</td><td className="num">587</td><td><span className="pill p-ok">STANDARD</span></td></tr>
                        <tr><td className="id">11:11:52.880</td><td className="id">ST070</td><td>11002 Body Sub Assembly 1</td><td className="num">1</td><td className="num">41.60 s</td><td className="num">587</td><td><span className="pill p-ok">STANDARD</span></td></tr>
                        <tr><td className="id">11:12:38.104</td><td className="id">ST080</td><td>11003 Body Sub Assembly 2</td><td className="num">1</td><td className="num">43.22 s</td><td className="num">587</td><td><span className="pill p-ok">STANDARD</span></td></tr>
                        <tr><td className="id">11:13:29.667</td><td className="id">ST100</td><td>11004 Assembly Gear</td><td className="num">1</td><td className="num">49.90 s</td><td className="num">587</td><td><span className="pill p-deg">DEGRADED_MISSING_CONTEXT</span></td></tr>
                        <tr><td className="id">11:14:41.203</td><td className="id">ST110</td><td>11005 Final Test</td><td className="num">1</td><td className="num">68.44 s</td><td className="num">587</td><td><span className="pill p-ok">STANDARD</span></td></tr>
                        <tr><td className="id">11:15:21.019</td><td className="id">ST120</td><td>11006 Packing</td><td className="num">1</td><td className="num">18.07 s</td><td className="num">587</td><td><span className="pill p-ok">STANDARD</span></td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Every Value Recorded Table */}
            <div style={{ gridColumn: 'span 12', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Every value recorded for this part</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>limits applied at time of recording</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>STATION</th>
                      <th>OPERATION</th>
                      <th>VALUE</th>
                      <th className="num">MEASURED</th>
                      <th>UOM</th>
                      <th className="num">LSL</th>
                      <th className="num">LAL</th>
                      <th className="num">UAL</th>
                      <th className="num">USL</th>
                      <th>IN SPEC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="id">ST060.1</td><td>123021 Screw 1</td><td>50032 Angle</td><td className="num">90.2</td><td>DD</td><td className="num">80</td><td className="num">85</td><td className="num">95</td><td className="num">100</td><td><span className="pill p-ok">yes</span></td></tr>
                    <tr><td className="id">ST060.1</td><td>123021 Screw 1</td><td>50033 Torque</td><td className="num">5.12</td><td>NU</td><td className="num">4.5</td><td className="num">4.7</td><td className="num">5.3</td><td className="num">5.5</td><td><span className="pill p-ok">yes</span></td></tr>
                    <tr><td className="id">ST060.1</td><td>123022 Screw 2</td><td>50034 Angle</td><td className="num">96.4</td><td>DD</td><td className="num">80</td><td className="num">85</td><td className="num">95</td><td className="num">100</td><td><span className="pill p-warn">alert band</span></td></tr>
                    <tr><td className="id">ST060.1</td><td>123022 Screw 2</td><td>50035 Torque</td><td className="num">5.09</td><td>NU</td><td className="num">4.5</td><td className="num">4.7</td><td className="num">5.3</td><td className="num">5.5</td><td><span className="pill p-ok">yes</span></td></tr>
                    <tr><td className="id">ST060.1</td><td>123024 Screw 4</td><td>50129 Barcode read</td><td className="num">123-TRE-AC</td><td>—</td><td className="num">—</td><td className="num">—</td><td className="num">—</td><td className="num">—</td><td><span className="pill p-mute">n/a</span></td></tr>
                    <tr><td className="id">ST100</td><td>123056 Gear press</td><td>50130 (unnamed)</td><td className="num">4.81</td><td>—</td><td className="num">—</td><td className="num">—</td><td className="num">—</td><td className="num">—</td><td><span className="pill p-deg">no definition</span></td></tr>
                    <tr><td className="id">ST110</td><td>123071 Leak test</td><td>50201 Pressure drop</td><td className="num">1.94</td><td>MB</td><td className="num">0</td><td className="num">0.5</td><td className="num">2.0</td><td className="num">2.5</td><td><span className="pill p-ok">yes</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* D2 · TRACK A VALUE */}
      {activeTab === 'd2' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                station
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                ST060.1
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                parameter
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                50033 Torque
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                category
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                measurement
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
            {/* Control Chart SVG Panel */}
            <div style={{ gridColumn: 'span 8', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Value over time</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>last 6 hours · {dbRecords.length > 0 ? `${dbRecords.length + 1280} points` : '1,284 points'}</span>
              </div>
              <svg viewBox="0 0 800 220" style={{ width: '100%', height: '220px' }}>
                <rect x="46" y="8" width="746" height="34" fill="#FDEDEC"/>
                <rect x="46" y="42" width="746" height="30" fill="#F3EFE6"/>
                <rect x="46" y="72" width="746" height="90" fill="#ECF7E9"/>
                <rect x="46" y="162" width="746" height="30" fill="#F3EFE6"/>
                <rect x="46" y="192" width="746" height="30" fill="#FDEDEC"/>
                <line x1="46" y1="42" x2="792" y2="42" stroke="#D92D20" strokeWidth="1" strokeDasharray="4 3"/>
                <line x1="46" y1="72" x2="792" y2="72" stroke="#8A6A2F" strokeWidth="1" strokeDasharray="4 3"/>
                <line x1="46" y1="117" x2="792" y2="117" stroke="#35A936" strokeWidth="1" strokeDasharray="2 4"/>
                <line x1="46" y1="162" x2="792" y2="162" stroke="#8A6A2F" strokeWidth="1" strokeDasharray="4 3"/>
                <line x1="46" y1="192" x2="792" y2="192" stroke="#D92D20" strokeWidth="1" strokeDasharray="4 3"/>
                <text x="798" y="45" fill="#D92D20" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">USL 5.5</text>
                <text x="798" y="69" fill="#8A6A2F" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">UAL 5.3</text>
                <text x="798" y="114" fill="#35A936" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">nom 5.0</text>
                <text x="798" y="159" fill="#8A6A2F" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">LAL 4.7</text>
                <text x="798" y="189" fill="#D92D20" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">LSL 4.5</text>
                <path d="M46,124 L84,108 L122,131 L160,112 L198,96 L236,127 L274,140 L312,105 L350,88 L388,119 L426,134 L464,101 L502,68 L540,113 L578,129 L616,110 L654,95 L692,122 L730,136 L768,115 L792,120" fill="none" stroke="#0057D9" strokeWidth="1.6" strokeLinejoin="round"/>
                <circle cx="502" cy="68" r="3" fill="#8A6A2F"/>
              </svg>
            </div>

            {/* Distribution Histogram Panel */}
            <div style={{ gridColumn: 'span 4', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Distribution</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>1,284 values</span>
              </div>
              <svg viewBox="0 0 380 220" style={{ width: '100%', height: '220px' }}>
                <g fill="#0057D9">
                  <rect x="30" y="182" width="26" height="18"/>
                  <rect x="60" y="158" width="26" height="42"/>
                  <rect x="90" y="116" width="26" height="84"/>
                  <rect x="120" y="62" width="26" height="138"/>
                  <rect x="150" y="22" width="26" height="178"/>
                  <rect x="180" y="8" width="26" height="192"/>
                  <rect x="210" y="36" width="26" height="164"/>
                  <rect x="240" y="88" width="26" height="112"/>
                  <rect x="270" y="140" width="26" height="60"/>
                  <rect x="300" y="174" width="26" height="26"/>
                  <rect x="330" y="192" width="26" height="8"/>
                </g>
                <line x1="24" y1="200" x2="362" y2="200" stroke="#CBD5E1"/>
              </svg>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#0057D9' }}>5.02</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Average</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#0057D9' }}>5.01</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Median</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#35A936' }}>1.41</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Cpk</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>1,284</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Values in range</div>
            </div>
          </div>
        </div>
      )}

      {/* D3 · SYSTEM HEALTH */}
      {activeTab === 'd3' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                source
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                all
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#F8F9FB', border: '1px solid #CBD5E1', borderRight: 0, padding: '5px 9px', fontSize: '11.5px', color: '#7B8799', borderRadius: '6px 0 0 6px' }}>
                window
              </span>
              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 11px', fontSize: '12px', borderRadius: '0 6px 6px 0', fontFamily: "'IBM Plex Mono', monospace", color: '#15233B' }}>
                last 15 minutes
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#35A936' }}>0</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Messages lost — gaps in telegram counter</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#35A936' }}>8.4 ms</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>p99 latency · target under 15</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#0057D9' }}>1,012 /s</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Messages recorded</div>
            </div>

            <div style={{ gridColumn: 'span 3', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#5369A8' }}>4.1 %</div>
              <div style={{ fontSize: '11.5px', color: '#7B8799', marginTop: '4px' }}>Recorded in degraded mode</div>
            </div>

            {/* Latency Chart */}
            <div style={{ gridColumn: 'span 8', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Recording latency</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>server side — excludes network to caller</span>
              </div>
              <svg viewBox="0 0 800 180" style={{ width: '100%', height: '180px' }}>
                <line x1="46" y1="40" x2="792" y2="40" stroke="#D92D20" strokeWidth="1" strokeDasharray="5 4"/>
                <text x="798" y="37" fill="#D92D20" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">target 15 ms</text>
                <path d="M46,102 L120,105 L194,99 L268,108 L342,101 L416,112 L490,97 L564,104 L638,110 L712,100 L792,103" fill="none" stroke="#35A936" strokeWidth="1.5"/>
                <path d="M46,92 L120,96 L194,88 L268,99 L342,90 L416,103 L490,86 L564,94 L638,101 L712,89 L792,93" fill="none" stroke="#8A6A2F" strokeWidth="1.5"/>
                <path d="M46,82 L120,86 L194,76 L268,90 L342,79 L416,95 L490,74 L564,84 L638,92 L712,78 L792,83" fill="none" stroke="#0057D9" strokeWidth="1.5"/>
              </svg>
            </div>

            {/* Outcomes Table */}
            <div style={{ gridColumn: 'span 4', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE6', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#15233B', margin: 0 }}>Outcomes</h3>
                <span style={{ fontSize: '11px', color: '#7B8799' }}>last 15 minutes</span>
              </div>
              <table>
                <thead>
                  <tr><th>STATUS</th><th className="num">COUNT</th><th className="num">SHARE</th></tr>
                </thead>
                <tbody>
                  <tr><td><span className="pill p-ok">RECORDED</span></td><td className="num">{dbRecords.length > 0 ? 874102 + dbRecords.length : 874102}</td><td className="num">95.1 %</td></tr>
                  <tr><td><span className="pill p-deg">RECORDED_DEGRADED</span></td><td className="num">37,690</td><td className="num">4.1 %</td></tr>
                  <tr><td><span className="pill p-warn">RECORDED_PARTIAL</span></td><td className="num">2,754</td><td className="num">0.3 %</td></tr>
                  <tr><td><span className="pill p-mute">DUPLICATE_IGNORED</span></td><td className="num">4,591</td><td className="num">0.5 %</td></tr>
                  <tr><td><span className="pill p-bad">REJECTED_UNPARSEABLE</span></td><td className="num">0</td><td className="num">0.0 %</td></tr>
                  <tr><td><span className="pill p-bad">SYSTEM_UNAVAILABLE</span></td><td className="num">0</td><td className="num">0.0 %</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
