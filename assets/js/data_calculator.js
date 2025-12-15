document.addEventListener("DOMContentLoaded", function () {
    // Reordered: Lumos first
    const scenarios = [
        { name: "Lumos Diffractogram", bpp: 16, channels: 1, bands: "Software-Defined*", type: "uint16", isLumos: true },
        { name: "RGB Standard", bpp: 8, channels: 3, bands: "3", type: "uint8" },
        { name: "Hyperspectral (Low)", bpp: 16, channels: 25, bands: "25", type: "float16" },
        { name: "Hyperspectral (Med)", bpp: 16, channels: 100, bands: "100", type: "float16" },
        { name: "Hyperspectral (High)", bpp: 16, channels: 200, bands: "200", type: "float16" }
    ];

    const lSelect = document.getElementById("side-length");
    const mSelect = document.getElementById("duration");
    const tbody = document.querySelector("#data-table tbody");

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function calculate() {
        const l = parseInt(lSelect.value);
        const mins = parseFloat(mSelect.value);
        const fps = 24;

        tbody.innerHTML = ""; // Clear table

        // First pass: Calculate sizes to find max for normalization
        let maxBytes = 0;
        const results = scenarios.map(s => {
            const pixels = l * l;
            const bitsPerFrame = pixels * s.bpp * s.channels;
            const bytesPerFrame = bitsPerFrame / 8;
            if (bytesPerFrame > maxBytes) maxBytes = bytesPerFrame;
            return {
                ...s,
                bytesPerFrame,
                totalVideoBytes: bytesPerFrame * mins * 60 * fps
            };
        });

        results.forEach(r => {
            const tr = document.createElement("tr");
            if (r.isLumos) {
                tr.classList.add("table-success");
            } else {
                tr.classList.add("table-danger");
            }

            // Calculate bar width (min 1% visible)
            const barWidth = Math.max(1, (r.bytesPerFrame / maxBytes) * 100);
            const barColorClass = r.isLumos ? "bg-success" : "bg-secondary";

            tr.innerHTML = `
                <td>
                    <span class="fw-bold">${r.name}</span>
                </td>
                <td class="text-center">${r.channels}</td>
                <td class="text-center">${r.bands}</td>
                <td class="text-center">${r.bpp}-bit <span class="text-muted small">(${r.type})</span></td>
                <td>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar ${barColorClass}" role="progressbar" style="width: ${barWidth}%" aria-valuenow="${barWidth}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </td>
                <td class="text-end font-monospace">${formatBytes(r.bytesPerFrame)}</td>
                <td class="text-end font-monospace">${formatBytes(r.totalVideoBytes)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Attach listeners
    lSelect.addEventListener("change", calculate);
    mSelect.addEventListener("change", calculate);

    // Initial run
    calculate();
});
