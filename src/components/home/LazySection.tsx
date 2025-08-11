import { useEffect, useRef, useState } from "react";

export default function LazySection({ placeholder, children }: { placeholder: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(()=>{
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((e)=>{ if (e.isIntersecting) { setShow(true); io.disconnect(); } });
    }, { rootMargin: '200px' });
    io.observe(el);
    return ()=>io.disconnect();
  },[]);
  return (
    <div ref={ref}>
      {show ? children : placeholder}
    </div>
  );
}
