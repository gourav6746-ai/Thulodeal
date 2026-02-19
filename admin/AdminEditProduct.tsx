
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import { Category, Product } from '../types';

const AdminEditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'shirts' as Category,
    description: '',
    stock: 0
  });
  const [imageURLs, setImageURLs] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setFormData({
            name: data.name,
            price: data.price,
            category: data.category,
            description: data.description,
            stock: data.stock
          });
          setImageURLs(data.imageURLs || []);
          setSizes(data.sizes || []);
        } else {
          alert("Product not found");
          navigate('/admin/products');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddImageField = () => {
    if (imageURLs.length < 6) {
      setImageURLs([...imageURLs, '']);
    }
  };

  const handleImageURLChange = (index: number, value: string) => {
    const newUrls = [...imageURLs];
    newUrls[index] = value;
    setImageURLs(newUrls);
  };

  const removeImageField = (index: number) => {
    const newUrls = imageURLs.filter((_, i) => i !== index);
    setImageURLs(newUrls.length ? newUrls : ['']);
  };

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize('');
    }
  };

  const removeSize = (s: string) => {
    setSizes(sizes.filter(size => size !== s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const validImages = imageURLs.filter(url => url.trim() !== '');
    if (validImages.length === 0) {
      alert("At least one product image is required.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'products', id), {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        sizes,
        imageURLs: validImages
      });
      alert("Editorial record updated.");
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-40 text-center uppercase tracking-widest text-zinc-500">Retrieving Record...</div>;

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-10">
        <div className="flex justify-between items-start mb-12">
           <div>
            <h2 className="text-3xl font-serif italic mb-2">Modify Record</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Editing: {id?.toUpperCase()}</p>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Product Title</label>
              <input 
                type="text" required 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Price ($)</label>
                <input 
                  type="number" required 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Stock Count</label>
                <input 
                  type="number" required 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Category</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400 appearance-none uppercase tracking-widest"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                <option value="shirts">Shirts</option>
                <option value="jeans">Jeans</option>
                <option value="shoes">Shoes</option>
                <option value="jackets">Jackets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Editorial Notes</label>
              <textarea 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400 h-40 resize-none leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Size Variations</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="Ex: L, 44"
                  value={newSize}
                  onChange={e => setNewSize(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                />
                <button type="button" onClick={handleAddSize} className="bg-zinc-800 px-6 hover:text-amber-400 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {sizes.map(s => (
                  <span key={s} className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-[10px] uppercase flex items-center gap-3 font-bold">
                    {s} <X size={12} className="cursor-pointer text-zinc-600 hover:text-red-400" onClick={() => removeSize(s)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Product Visuals (Up to 6)</label>
                <button 
                  type="button" 
                  onClick={handleAddImageField}
                  disabled={imageURLs.length >= 6}
                  className="text-[10px] uppercase tracking-widest text-amber-400 font-bold disabled:opacity-30 flex items-center gap-2"
                >
                  <Plus size={14} /> Add Slot
                </button>
              </div>
              
              <div className="space-y-4">
                {imageURLs.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <input 
                        type="text" required 
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 text-xs focus:outline-none focus:border-amber-400"
                        placeholder={`Image URL ${index + 1}`}
                        value={url}
                        onChange={e => handleImageURLChange(index, e.target.value)}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeImageField(index)}
                      className="p-4 bg-zinc-950 border border-zinc-800 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grid Preview */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {imageURLs.map((url, index) => (
                  url.trim() ? (
                    <div key={index} className="aspect-[3/4] bg-zinc-950 border border-zinc-800 overflow-hidden group relative">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover transition-all" />
                      <div className="absolute top-2 left-2 bg-black/70 text-[8px] px-1.5 py-0.5 uppercase tracking-widest">#{index + 1}</div>
                    </div>
                  ) : (
                    <div key={index} className="aspect-[3/4] bg-zinc-950/50 border border-zinc-800 border-dashed flex items-center justify-center text-zinc-800">
                      <ImageIcon size={24} />
                    </div>
                  )
                ))}
              </div>
            </div>

            <button 
              type="submit" disabled={saving}
              className="w-full py-6 bg-white text-black text-xs uppercase tracking-[0.4em] font-black hover:bg-amber-400 transition-all disabled:opacity-50 mt-12 flex items-center justify-center gap-4"
            >
              {saving ? 'UPDATING...' : <><Save size={18} /> SAVE CHANGES</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
