"use client"

const CREATORS = [
  { handle: "lucasresellzz", followers: "491K", img: "img_01kfxsfz3cfc9rvx00n8wjns5m" },
  { handle: "ak.movez",       followers: "351K", img: "img_01kfxsfz85npkj73v9y2xz4wca" },
  { handle: "flippaplugz",    followers: "333K", img: "img_01kfxsfz3c3gzp27jwqryd5y34" },
  { handle: "pia.resell",     followers: "170K", img: "img_01kfxsg0b6mr5xam91s9r5fjtw" },
  { handle: "cashoutmike",    followers: "168K", img: "img_01kfxsg0br0bh550d4bsd5v2kh" },
  { handle: "toolduque",      followers: "161K", img: "img_01kfxsfz3dw428k3caemq5rbxa" },
  { handle: "hmresells",      followers: "120K", img: "img_01kfxsfz8b3jthmw0mcpf30pmx" },
  { handle: "nonosellzz",     followers: "115K", img: "img_01kfxsfz3fg01kc9kky0kwpxg1" },
  { handle: "bryzy.resell",   followers: "100K", img: "img_01kfxsfz2m551skrgfykzxkzh1" },
  { handle: "izayesflips",    followers: "89K",  img: "img_01kfxsfz3bm0gn0wz7b0gp0mr6" },
  { handle: "daeresells1",    followers: "87K",  img: "img_01kfxsfz1fak2zjva0zz154jxp" },
]

const CHECK_ICON = (
  <div className="w-3.5 h-3.5 rounded-full bg-[#3a0ca3] flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2 text-white" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </div>
)

function CreatorCard({ handle, followers, img }: typeof CREATORS[0]) {
  return (
    <div className="flex-shrink-0 w-52 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={`https://assets.scaled.info/api/img/${img}`}
          alt={handle}
          className="w-14 h-14 rounded-full border-2 border-slate-100 object-cover shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">@{handle}</h4>
            {CHECK_ICON}
          </div>
          <span className="text-xs text-slate-500 font-medium">{followers} followers</span>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ reverse = false, speed = 40 }: { reverse?: boolean; speed?: number }) {
  const doubled = [...CREATORS, ...CREATORS]
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          animation: `marquee-${reverse ? "reverse" : "forward"} ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {doubled.map((c, i) => (
          <CreatorCard key={`${c.handle}-${i}`} {...c} />
        ))}
      </div>
    </div>
  )
}

export function CreatorsMarquee() {
  return (
    <div className="relative overflow-hidden">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />
      <MarqueeRow speed={38} />
    </div>
  )
}
