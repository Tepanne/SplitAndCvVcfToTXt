// Fungsi untuk memecah file VCF
document.getElementById('splitButton').addEventListener('click', function() {
    const file = document.getElementById('vcfFileInput').files[0];
    const contactsPerFile = parseInt(document.getElementById('contactsPerFile').value, 10);
    const startNumber = parseInt(document.getElementById('startNumberInput').value, 10) || 1;
    let fileName = document.getElementById('splitFileNameInput').value.trim();
    const additionalFileName = document.getElementById('additionalFileNameInput').value.trim();

    const fileNameParts = fileName.split('§').map(part => part.trim());

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
        splitVcfFilesDiv.innerHTML = '';

        splitFiles.forEach((blob, index) => {
            const currentIndex = startNumber + index;
            const link = document.createElement('a');

            // Membuat nama file berdasarkan kondisi pemisahan "§"
            let generatedFileName;
            if (fileNameParts.length > 1) {
                generatedFileName = `${fileNameParts[0]} ${currentIndex}`;
            } else {
                generatedFileName = `${fileNameParts[0]}${currentIndex}`;
            }

            // Menambahkan nama file tambahan jika diisi
            if (additionalFileName) {
                generatedFileName += ` ${additionalFileName}`;
            }

            generatedFileName += '.vcf';

            link.href = URL.createObjectURL(blob);
            link.download = generatedFileName;
            link.textContent = `Download ${generatedFileName}`;
            splitVcfFilesDiv.appendChild(link);
            splitVcfFilesDiv.appendChild(document.createElement('br'));
        });

        console.log('Memecah file VCF');
    };
    reader.readAsText(file);
});

// Fungsi untuk mengonversi VCF ke TXT
document.getElementById('convertButton').addEventListener('click', function() {
    const file = document.getElementById('vcfFileInputTxt').files[0];
    const outputTextArea = document.getElementById('outputTextArea');
    const outputFileName = document.getElementById('outputFileNameInput').value.trim();

    if (!file) {
        alert('Silakan pilih file VCF untuk dikonversi!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const contacts = content.split('END:VCARD').map(contact => contact.trim()).filter(contact => contact.length > 0);
        let phoneNumbers = contacts.map(contact => {
            const match = contact.match(/TEL:(.+)/);
            return match ? match[1] : null;
        }).filter(Boolean);

        // Menampilkan nomor telepon di textarea
        outputTextArea.value = phoneNumbers.join('\n');
        document.getElementById('totalContacts').innerText = `Total contacts: ${phoneNumbers.length}`;

        // Menyiapkan unduhan file TXT
        const blob = new Blob([outputTextArea.value], { type: 'text/plain' });
        const txtDownloadLink = document.getElementById('txtDownloadLink');
        txtDownloadLink.innerHTML = ''; // Bersihkan link download sebelumnya

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = outputFileName ? `${outputFileName}.txt` : 'output.txt';
        link.textContent = 'Download TXT';
        txtDownloadLink.appendChild(link);
    };
    reader.readAsText(file);
});
