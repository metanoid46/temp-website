import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import axios from 'axios';
import './App.css';  // Import external CSS for styling

const TextEditor: React.FC = () => {
    const editor = useEditor({
        extensions: [StarterKit, Image],
        content: '<p>Type your content here...</p>',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const [expired, setExpired] = useState<boolean | null>(null);
    const [expirationTime, setExpirationTime] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpirationStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/check-expiration');
                setExpired(response.data.expired);
                setExpirationTime(response.data.expirationTime);
            } catch (error) {
                console.error('Error fetching expiration status:', error);
            }
        };

        fetchExpirationStatus();
    }, []);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = () => {
                editor.chain().focus().setImage({ src: reader.result as string }).run();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInsertCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && editor) {
            const dataURL = canvas.toDataURL('image/png');
            editor.chain().focus().setImage({ src: dataURL }).run();
            setShowCanvas(false);
        }
    };

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();

        canvas.onmousemove = draw;
        canvas.onmouseup = () => (canvas.onmousemove = null);

        function draw(ev: MouseEvent) {
            if (ctx) {
                ctx.lineTo(ev.offsetX, ev.offsetY);
                ctx.stroke();
            }
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-toolbar">
                <button onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
                <button onClick={() => fileInputRef.current?.click()}>Upload Signature</button>
                <button onClick={() => setShowCanvas(true)}>Draw Signature</button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
            </div>

            {expired === null ? (
                <p>Loading expiration status...</p>
            ) : expired ? (
                <p>Your session has expired. Please refresh.</p>
            ) : (
                <>
                    <p>Expiration Time: {expirationTime}</p>
                    <EditorContent editor={editor} className="editor-content" />
                    {showCanvas && (
                        <div className="canvas-popup">
                            <h3>Draw Signature</h3>
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={150}
                                onMouseDown={startDrawing}
                                className="signature-canvas"
                            />
                            <div>
                                <button onClick={handleInsertCanvas}>Insert</button>
                                <button onClick={handleClearCanvas}>Clear</button>
                                <button onClick={() => setShowCanvas(false)}>Close</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TextEditor;
