export default function FirmaCargada({ onSave }) {
    const handleFile = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => onSave(reader.result);
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={handleFile} />
      </div>
    );
  }