const fs = require('fs');
let code = fs.readFileSync('app/dashboard/products/page.tsx', 'utf8');

// Replace Category input
const catRegex = /<label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category<\/label>\s*<input type="text" value={formData\.category} onChange={e => setFormData\(\{...formData, category: e\.target\.value\}\)} style={inputStyle\(false\)} \/>/g;

const catReplacement = `<label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle(false)}>
                      <option value="">Select Category...</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Sports & Fitness">Sports & Fitness</option>
                      <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                      {Array.from(new Set(products.map(p => p.category).filter(c => c && !['Home & Living', 'Fashion', 'Electronics', 'Beauty & Skincare', 'Food & Beverages', 'Books & Stationery', 'Sports & Fitness', 'Jewelry & Accessories'].includes(c)))).map(c => (
                        <option key={String(c)} value={String(c)}>{String(c)}</option>
                      ))}
                    </select>`;

code = code.replace(catRegex, catReplacement);

// Replace Image URL input
const imgRegex = /<label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Image URL<\/label>\s*<input type="text" value={formData\.imageUrl} onChange={e => setFormData\(\{...formData, imageUrl: e\.target\.value\}\)} style={inputStyle\(false\)} \/>/g;

const imgReplacement = `<label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Product Image (Upload or URL)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        placeholder="Paste Image URL..."
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        style={inputStyle(false)} 
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: 600 }}>OR</span>
                    <label style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid var(--line)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--navy)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      <Upload size={13} /> Upload File
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, imageUrl: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div style={{ marginTop: '12px', padding: '8px', border: '1px solid var(--line)', borderRadius: '6px', display: 'inline-block' }}>
                      <img src={formData.imageUrl} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  )}`;

code = code.replace(imgRegex, imgReplacement);

fs.writeFileSync('app/dashboard/products/page.tsx', code);
console.log('Done replacement logic');
