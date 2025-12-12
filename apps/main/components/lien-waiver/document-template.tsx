import React from "react";

export interface DocumentTemplateProps {
    vendorName: string;
    customerName: string;
    jobLocation: string;
    owner: string;
    throughDate: string;
    amountOfCheck: string;
    waiverReleaseDate: string;
    unpaidProgressAmount: string;
    signature: string | null;
    claimantTitle: string;
    signatureDate: string;
}

export function DocumentTemplate({
    vendorName,
    customerName,
    jobLocation,
    owner,
    throughDate,
    amountOfCheck,
    waiverReleaseDate,
    unpaidProgressAmount,
    signature,
    claimantTitle,
    signatureDate,
}: DocumentTemplateProps) {
    return (
        <div
            style={{
                all: "initial",
                display: "block",
                backgroundColor: "#ffffff",
                color: "#000000",
                padding: "32px",
                fontFamily: "Times New Roman, Times, serif",
                fontSize: "11px",
                lineHeight: 1.5,
                width: "612px",
                minHeight: "792px",
                boxSizing: "border-box",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 2px 0", color: "#000000", fontFamily: "Times New Roman, Times, serif" }}>
                    CONDITIONAL WAIVER AND RELEASE ON
                </p>
                <p style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 4px 0", color: "#000000", fontFamily: "Times New Roman, Times, serif" }}>
                    PROGRESS PAYMENT
                </p>
                <p style={{ fontSize: "10px", color: "#666666", margin: 0, fontFamily: "Times New Roman, Times, serif" }}>
                    (CA CIVIL CODE 8132)
                </p>
            </div>

            {/* Notice */}
            <div style={{ marginBottom: "16px", fontSize: "10px", fontFamily: "Times New Roman, Times, serif" }}>
                <p style={{ fontWeight: "bold", color: "#000000", margin: 0 }}>
                    NOTICE: THIS DOCUMENT WAIVES THE CLAIMANT&apos;S LIEN, STOP PAYMENT NOTICE, AND PAYMENT BOND RIGHTS
                    EFFECTIVE ON RECEIPT OF PAYMENT. A PERSON SHOULD NOT RELY ON THIS DOCUMENT UNLESS SATISFIED THAT THE
                    CLAIMANT HAS RECEIVED PAYMENT.
                </p>
            </div>

            {/* Identifying Information */}
            <div style={{ marginBottom: "16px", fontFamily: "Times New Roman, Times, serif" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#000000", fontSize: "11px", marginTop: 0 }}>
                    Identifying Information:
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "112px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Name of Claimant:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{vendorName}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "112px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Name of Customer:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{customerName}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "112px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Job Location:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{jobLocation}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "64px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Owner:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{owner}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "96px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Through Date:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{throughDate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Conditional Waiver and Release */}
            <div style={{ marginBottom: "16px", fontFamily: "Times New Roman, Times, serif" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#000000", fontSize: "11px", marginTop: 0 }}>
                    Conditional Waiver and Release
                </p>

                <p style={{ fontSize: "10px", marginBottom: "12px", textAlign: "justify", color: "#000000", marginTop: 0 }}>
                    This document waives and releases lien, stop payment notice, and payment bond rights the claimant has for labor and service provided, and
                    equipment and material delivered, to the customer on this job through the Through Date of this document. Rights based upon labor or service
                    provided, or equipment or material delivered, pursuant to a written change order that has been fully executed by the parties prior to the date that this
                    document is signed by the claimant, are waived and released by this document, unless listed as an Exception below. This document is effective only on
                    the claimant&apos;s receipt of payment from the financial institution on which the following check is drawn.
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "96px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Maker of Check:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{customerName}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "112px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Amount of Check: $</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{amountOfCheck}</td>
                        </tr>
                        <tr>
                            <td style={{ width: "112px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Check Payable to:</td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{vendorName}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Exceptions */}
            <div style={{ marginBottom: "16px", fontFamily: "Times New Roman, Times, serif" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#000000", fontSize: "11px", marginTop: 0 }}>
                    Exceptions
                </p>

                <p style={{ fontSize: "10px", marginBottom: "8px", color: "#000000", marginTop: 0 }}>
                    This document does not affect any of the following:
                </p>

                <div style={{ fontSize: "10px", marginLeft: "16px", color: "#000000" }}>
                    <p style={{ margin: "4px 0" }}>(1) Retentions.</p>
                    <p style={{ margin: "4px 0" }}>(2) Extras for which the claimant has not received payment.</p>
                    <p style={{ margin: "4px 0" }}>(3) The following progress payments for which the claimant has previously given a conditional waiver and release but has not received payment:</p>

                    <table style={{ width: "calc(100% - 16px)", borderCollapse: "collapse", fontSize: "10px", marginLeft: "16px", marginTop: "4px", marginBottom: "4px" }}>
                        <tbody>
                            <tr>
                                <td style={{ width: "144px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Date(s) of waiver and release:</td>
                                <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{waiverReleaseDate}</td>
                            </tr>
                            <tr>
                                <td style={{ width: "192px", padding: "2px 0", color: "#000000", verticalAlign: "bottom" }}>Amount(s) of unpaid progress payment(s): $</td>
                                <td style={{ borderBottom: "1px solid #000000", padding: "2px 4px", color: "#000000", verticalAlign: "bottom" }}>{unpaidProgressAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p style={{ margin: "4px 0" }}>(4) Contract rights, including:</p>
                    <div style={{ marginLeft: "16px" }}>
                        <p style={{ margin: "2px 0", fontSize: "10px" }}>(A) A right based on rescission, abandonment, or breach of contract, and</p>
                        <p style={{ margin: "2px 0", fontSize: "10px" }}>(B) The right to recover compensation for work not compensated by the payment.</p>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div style={{ marginTop: "32px", width: "50%", marginLeft: "auto", fontFamily: "Times New Roman, Times, serif" }}>
                {/* SIGNATURE Header */}
                <div style={{ marginBottom: "8px" }}>
                    <span style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#000000",
                        borderBottom: "2px solid #000000",
                        paddingBottom: "2px",
                    }}>SIGNATURE</span>
                </div>

                {/* Signature Fields Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "120px", padding: "8px 0 4px 0", color: "#000000", verticalAlign: "bottom", whiteSpace: "nowrap" }}>
                                Claimant&apos;s Signature:
                            </td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "4px", color: "#000000", verticalAlign: "bottom", height: "40px" }}>
                                {signature && (
                                    <img
                                        src={signature}
                                        alt="Signature"
                                        style={{ height: "36px", maxWidth: "100%" }}
                                    />
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "120px", padding: "8px 0 4px 0", color: "#000000", verticalAlign: "bottom", whiteSpace: "nowrap" }}>
                                Claimant&apos;s Title:
                            </td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "4px", color: "#000000", verticalAlign: "bottom" }}>
                                {claimantTitle}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "120px", padding: "8px 0 4px 0", color: "#000000", verticalAlign: "bottom", whiteSpace: "nowrap" }}>
                                Date of Signature:
                            </td>
                            <td style={{ borderBottom: "1px solid #000000", padding: "4px", color: "#000000", verticalAlign: "bottom" }}>
                                {signatureDate}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
