// Fungsi untuk memecah file VCF
document.getElementById('splitButton').addEventListener('click', function() {
    const file = document.getElementById('vcfFileInput').files[0];
    const contactsPerFile = parseInt(document.getElementById('contactsPerFile').value, 10);
    let fileName = document.getElementById('splitFileNameInput').value.trim() || 'split';
    const startNumber = parseInt(document.getElementById('startNumberInput').value, 10) || 1; // Nomor awal

    if (!file || isNaN(contactsPerFile) || contactsPerFile <= 0) {
        alert('Masukkan file VCF dan jumlah kontak per file yang valid!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const contacts = content.split('END:VCARD').map(contact => contact.trim() + '\nEND:VCARD').filter(contact => contact.length > 10);

        if (contacts.length === 0) {
            alert('File VCF tidak berisi kontak yang valid!');
            return;
        }

        const splitFiles = [];
        for (let i = 0; i < contacts.length; i += contactsPerFile) {
            const vcfContent = contacts.slice(i, i + contactsPerFile).join('\n');
            const blob = new Blob([vcfContent], { type: 'text/vcard' });
            splitFiles.push(blob);
        }

        const splitVcfFilesDiv = document.getElementById('splitVcfFiles');
        splitVcfFilesDiv.innerHTML = ''; // Bersihkan link download sebelumnya

        splitFiles.forEach((blob, index) => {
            const currentIndex = startNumber + index; // Hitung nomor file saat ini
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}-${currentIndex}.vcf`;
            link.classList.add('download-link');
            link.textContent = `${fileName}-${currentIndex}.vcf`;
            splitVcfFilesDiv.appendChild(link);
            splitVcfFilesDiv.appendChild(document.createElement('br'));
        });

        // Log activity
        logActivity('Memecah file VCF');
    };
    reader.readAsText(file);
});

// Fungsi untuk mengonversi VCF ke TXT (hanya nomor telepon)
document.getElementById('vcfFileInputTxt').addEventListener('change', function() {
    const file = this.files[0];

    if (!file) {
        alert('Masukkan file VCF yang valid!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const phoneNumbers = [];

        // Mengurai konten VCF dan menambahkan nomor telepon ke array
        const vcardEntries = content.split('END:VCARD');
        vcardEntries.forEach(entry => {
            const telMatch = entry.match(/TEL:(.+)/);
            if (telMatch) {
                // Hapus tanda '+' dari nomor telepon
                const phoneNumber = telMatch[1].trim().replace(/^\+/, '');
                phoneNumbers.push(phoneNumber);
            }
        });

        const textArea = document.getElementById('outputTextArea');
        textArea.value = phoneNumbers.join('\n');

        // Update jumlah kontak
        const totalContacts = phoneNumbers.length;
        document.getElementById('totalContacts').textContent = `Total contacts: ${totalContacts}`;
    };
    reader.readAsText(file);
});

document.getElementById('convertButton').addEventListener('click', function() {
    const textAreaContent = document.getElementById('outputTextArea').value;
    const outputFileName = document.getElementById('outputFileNameInput').value.trim() || 'contacts';

    if (!textAreaContent) {
        alert('Tidak ada nomor telepon untuk dikonversi!');
        return;
    }

    const blob = new Blob([textAreaContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${outputFileName}.txt`;
    link.classList.add('download-link');
    link.textContent = `Download ${outputFileName}.txt`;

    const downloadLinkDiv = document.getElementById('txtDownloadLink');
    downloadLinkDiv.innerHTML = ''; // Bersihkan link download sebelumnya
    downloadLinkDiv.appendChild(link);
});

// Fungsi untuk log aktivitas
function logActivity(message) {
    console.log(message);
}
