import "./Nebula.css";

export default function Nebula() {
    return (
        <div className="nebula-container">
            <div className="nebula nebula-1"></div>
            <div className="nebula nebula-2"></div>
            <div className="nebula nebula-3"></div>
            <div className="nebula nebula-4"></div>
        </div>
    );
}

// FUTURE ENHANCEMENT: replace it with a PNG/WebP nebula texture that has transparency. Real nebula textures have irregular shapes, wispy edges, and color variation that's difficult to reproduce with blurred circles alone.