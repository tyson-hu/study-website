import { cn } from "@/lib/utils"

export function MeshGradient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute -top-[20%] left-1/2 h-[70%] w-[90%] -translate-x-1/2 opacity-70 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse at center, #007cf0 0%, #00dfd8 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[10%] -right-[10%] h-[60%] w-[70%] opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, #7928ca 0%, #ff0080 50%, transparent 75%)",
        }}
      />
      <div
        className="absolute -bottom-[10%] left-[5%] h-[55%] w-[75%] opacity-55 blur-[110px]"
        style={{
          background:
            "radial-gradient(ellipse at center, #ff4d4d 0%, #f9cb28 50%, transparent 75%)",
        }}
      />
      <div
        className="absolute top-[30%] left-[15%] h-[50%] w-[60%] opacity-40 blur-[130px]"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #007cf0, #7928ca, #ff0080, #ff4d4d, #00dfd8, #007cf0)",
        }}
      />
    </div>
  )
}
