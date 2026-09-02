export function IconButton({
    label,
    children,
    onClick,
    danger = false,
}: {
    label: string;
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`icon-btn ${danger ? "icon-danger" : ""}`}
        >
            {children}
        </button>
    );
}