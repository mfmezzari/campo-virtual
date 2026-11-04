import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="pb-8 pt-10 text-center">
      <Link to="/login" className="text-xs font-semibold tracking-wide text-ink-300">
        DETEC (ÁREA RESTRITA)
      </Link>
    </footer>
  );
}
