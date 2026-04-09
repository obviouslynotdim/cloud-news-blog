import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../../config/constants';
import { buildApiUrl } from '../../utils/api';

export function PublishForm({ onCreated }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: 'World',
    author: '',
    content: ''
  });
  const [status, setStatus] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function resetImageSelection() {
    setImageFile(null);
    setImagePreviewUrl('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function uploadImageFile(file) {
    return new Promise((resolve, reject) => {
      const uploadBody = new FormData();
      uploadBody.append('image', file);

      const request = new XMLHttpRequest();
      request.open('POST', buildApiUrl('/api/uploads/image'));

      request.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) {
          return;
        }

        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      });

      request.addEventListener('load', () => {
        try {
          const response = JSON.parse(request.responseText || '{}');
          if (request.status < 200 || request.status >= 300) {
            reject(new Error(response.error || 'Image upload failed'));
            return;
          }

          resolve(response);
        } catch {
          reject(new Error('Image upload failed'));
        }
      });

      request.addEventListener('error', () => reject(new Error('Image upload failed')));
      request.addEventListener('abort', () => reject(new Error('Image upload was cancelled')));
      request.send(uploadBody);
    });
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!imageFile) {
      setStatus('Please choose a cover image first.');
      return;
    }

    setStatus('Uploading image...');

    let uploadResult;
    try {
      uploadResult = await uploadImageFile(imageFile);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Image upload failed');
      return;
    }

    setStatus('Publishing story...');

    const response = await fetch(buildApiUrl('/api/news'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imageUrl: uploadResult.imageUrl })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || 'Publish failed');
      return;
    }

    setStatus('Published successfully');
    setForm({ title: '', summary: '', category: 'World', author: '', content: '' });
    resetImageSelection();
    onCreated(result.post.slug);
  }

  function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      resetImageSelection();
      return;
    }

    setImageFile(file);
    setImagePreviewUrl((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(file);
    });
    setStatus('');
  }

  function onDragOver(event) {
    event.preventDefault();
    setDragActive(true);
  }

  function onDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setStatus('Please drop an image file.');
      return;
    }

    setImageFile(file);
    setImagePreviewUrl((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(file);
    });
    setStatus('');
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl">Publish a story</h2>
      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm font-bold">
          Title
          <input
            required
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Summary
          <input
            required
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Category
            <select
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Author
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={form.author}
              onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            />
          </label>
        </div>
        <div className="grid gap-1 text-sm font-bold">
          Cover image
          <div
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition ${
              dragActive ? 'border-teal-500 bg-teal-50' : imagePreviewUrl ? 'border-slate-300 bg-slate-100' : 'border-slate-300 bg-slate-50'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
            {imagePreviewUrl ? (
              <div className="relative">
                <img src={imagePreviewUrl} alt="Cover preview" className="h-56 w-full object-cover" />
                <div className="absolute inset-0 flex items-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <button
                    type="button"
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 backdrop-blur-sm hover:bg-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Change image
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-red-600 backdrop-blur-sm hover:bg-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      resetImageSelection();
                    }}
                  >
                    Remove
                  </button>
                  <span className="ml-auto max-w-[50%] truncate text-xs text-white/80">{imageFile?.name}</span>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div className="h-full bg-teal-400 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center gap-3 p-10 text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="mt-0.5 text-xs font-normal text-slate-500">PNG, JPG, WEBP up to 10 MB</p>
                </div>
              </button>
            )}
          </div>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Content
          <textarea
            required
            rows={7}
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          />
        </label>
        <button className="w-fit rounded-xl bg-teal-700 px-5 py-3 text-sm font-extrabold text-white" type="submit">
          Publish story
        </button>
      </form>
      {status ? <p className="mt-3 text-sm font-semibold text-teal-700">{status}</p> : null}
    </section>
  );
}
