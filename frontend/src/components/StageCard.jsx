import React from 'react';
import { Shield } from 'lucide-react';

const StageCard = ({ stage }) => {
    const gainHp = stage.tunedHp - stage.stockHp;
    const gainNm = stage.tunedNm - stage.stockNm;

    return (
        <>
            <style>
                {`/* EngineTuningTable.css */

.card {
  background: var(--bg-card, #f7f7f7);
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 900px;
  font-family: system-ui, sans-serif;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.table-container {
  width: 100%;
  overflow-x: auto; /* horizontal scroll on small screens */
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
}

.responsive-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--border);
}

.responsive-table .highlight {
  color: var(--primary);
  font-weight: bold;
}

.responsive-table .success {
  color: var(--success);
  font-weight: bold;
}

.responsive-table .warning {
  color: var(--warning);
}

.responsive-table .price {
  color: var(--secondary);
  font-weight: bold;
}

/* Mobile: stacked rows (card‑like) for better readability */
@media (max-width: 600px) {
  .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
    display: block;
    width: 100%;
  }
  .responsive-table tr {
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px;
  }
  .responsive-table td {
    padding-left: 50%;
    text-align: left;
    position: relative;
  }
  .responsive-table td::before {
    content: attr(data-label) ": ";
    position: absolute;
    left: 10px;
    width: 45%;
    font-weight: bold;
  }
}
`}
            </style>
            <div className="card animate-in" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
                <div className="flex-between">
                    <h3>{stage.stageName}</h3>
                </div>

                <div className="table-container py-2 px-3">
                    <table className="responsive-table">
                        <tbody>
                            {/* <tr>
                                <td data-label="Engine type">Engine type</td>
                                <td data-label="Value"><strong>{stage.engineType}</strong></td>
                            </tr> */}
                            {/* <tr>
                                <td data-label="Engine size">Engine size</td>
                                <td data-label="Value">
                                    <strong>{stage.engineSizeCm} cm<sup>3</sup></strong>
                                </td>
                            </tr> */}
                            <tr>
                                <td data-label="ECU type">ECU type</td>
                                <td data-label="Value"><strong>{stage.ecuType}</strong></td>
                            </tr>

                            <tr>
                                <td data-label="Stock Power">Stock Power</td>
                                <td data-label="Value"><strong>{stage.stockHp} HP / {stage.stockNm} Nm</strong></td>
                            </tr>

                            <tr>
                                <td data-label="Tuned Power">Tuned Power</td>
                                <td data-label="Value" >
                                    {stage.tunedHp} HP / {stage.tunedNm} Nm
                                </td>
                            </tr>

                            <tr>
                                <td data-label="Gain">Gain</td>
                                <td data-label="Value" >
                                    +{gainHp} HP / +{gainNm} Nm
                                </td>
                            </tr>

                            {stage.notes && (
                                <tr>
                                    <td data-label="Notes">Notes</td>
                                    <td data-label="Value">{stage.notes}</td>
                                </tr>
                            )}

                            {stage.ecuNotes && (
                                <tr>
                                    <td data-label="ECU/CPC Requirement">ECU/CPC Requirement</td>
                                    <td data-label="Value">{stage.ecuNotes}</td>
                                </tr>
                            )}

                            {(stage.cpcUpgrade || stage.ecuUnlock) && (
                                <tr>
                                    <td data-label="Upgrades Required">Upgrades Required</td>
                                    <td data-label="Value" >
                                        {stage.cpcUpgrade && "CPC Upgrade "}
                                        {stage.ecuUnlock && "ECU Unlock"}
                                    </td>
                                </tr>
                            )}

                            {stage.price != null && (
                                <tr>
                                    <td data-label="Price">Price</td>
                                    <td data-label="Value" className="price">€{stage.price.toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
};

export default StageCard;