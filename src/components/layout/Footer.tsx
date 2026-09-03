/**
 * playground-design/ 10개 파일에서 텍스트/구조가 동일한 footer.
 * padding-bottom은 페이지마다 56px(7개 파일)/50px(schedule.html)로 갈리는데,
 * 다수 페이지가 쓰는 56px(28px 28px 56px)을 공통값으로 채택한다.
 * (docs/DESIGN-SYSTEM.md 4.3절)
 */
export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1220px] justify-between border-t border-border px-7 pt-7 pb-14 font-mono text-[11px] text-silk-faint">
      <span>PLAY_GROUND / rev.0.2</span>
      <span>© 2026 PLAY GROUND</span>
    </footer>
  );
}
