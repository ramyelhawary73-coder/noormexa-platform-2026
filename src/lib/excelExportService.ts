/**
 * NOORMEXA EXCEL & CSV MANIFEST GENERATOR
 * Generates official logistics export sheets compatible with Excel, Google Sheets,
 * and shipping carrier portals (SMSA, Aramex, Bosta, DHL, SPL, Couriers).
 */

export interface ExportManifestOptions {
  sheetTitle: string;
  storeName: string;
  storePhone?: string;
  generatedBy?: string;
  currency?: string;
  includeDeliveryOtp?: boolean;
}

export function generateCsvManifest(
  headers: string[],
  rows: Array<Array<string | number | undefined | null>>
): string {
  // UTF-8 BOM ensures Arabic characters render perfectly in Microsoft Excel without encoding glitches
  const BOM = "\uFEFF";

  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  return BOM + csvContent;
}

export function downloadCsvFile(filename: string, csvData: string) {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
