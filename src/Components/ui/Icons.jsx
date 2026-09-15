import React from "react";

/**
 * Inline stroke icons (24x24) so the app carries no icon dependency and
 * every glyph inherits `currentColor` from its surroundings.
 */
const make = (displayName, paths) => {
  const Comp = ({ size = 20, className = "", strokeWidth = 1.75, ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  );
  Comp.displayName = displayName;
  return Comp;
};

export const HomeIcon = make(
  "HomeIcon",
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h3.5v-5.5h5V21H18a1 1 0 0 0 1-1V9.5" />
  </>
);

export const UsersIcon = make(
  "UsersIcon",
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const TagIcon = make(
  "TagIcon",
  <>
    <path d="M3.6 11.5V4.6a1 1 0 0 1 1-1h6.9a2 2 0 0 1 1.41.58l7.1 7.1a2 2 0 0 1 0 2.83l-6.9 6.9a2 2 0 0 1-2.83 0l-7.1-7.1a2 2 0 0 1-.58-1.41Z" />
    <circle cx="7.9" cy="7.9" r="1.15" />
  </>
);

export const ReceiptIcon = make(
  "ReceiptIcon",
  <>
    <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2Z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h5" />
  </>
);

/**
 * The BillBox mark: an isometric carton, its three faces one colour at three
 * weights. Filled rather than stroked and drawn on a 48 grid, so it is the
 * one glyph here that does not come from `make` — and it is the same geometry
 * the loader animates, so the logo and the waiting state are one object.
 */
export const CrateIcon = ({ size = 20, className = "", ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    /* Cropped to the artwork rather than the loader's 48 box, which carried
       room for the lift animation — inside a badge that padding read as a
       mark two sizes too small. */
    viewBox="6.5 2.7 35 35"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <polygon points="24,4.2 37.4,11.9 24,19.6 10.6,11.9" />
    <polygon points="38.2,13.1 38.2,28.4 24.8,36.1 24.8,20.8" opacity="0.72" />
    <polygon points="9.8,13.1 23.2,20.8 23.2,36.1 9.8,28.4" opacity="0.5" />
  </svg>
);
CrateIcon.displayName = "CrateIcon";

export const UserCircleIcon = make(
  "UserCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.2 18.4a6.5 6.5 0 0 1 11.6 0" />
  </>
);

export const MenuIcon = make(
  "MenuIcon",
  <>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </>
);

export const MoreHorizontalIcon = make(
  "MoreHorizontalIcon",
  <>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </>
);

export const XIcon = make(
  "XIcon",
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);

export const ChevronLeftIcon = make(
  "ChevronLeftIcon",
  <path d="m15 18-6-6 6-6" />
);
export const ChevronRightIcon = make(
  "ChevronRightIcon",
  <path d="m9 18 6-6-6-6" />
);
export const ChevronDownIcon = make(
  "ChevronDownIcon",
  <path d="m6 9 6 6 6-6" />
);
export const ChevronUpIcon = make("ChevronUpIcon", <path d="m18 15-6-6-6 6" />);

export const ChevronsLeftIcon = make(
  "ChevronsLeftIcon",
  <>
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </>
);

export const ChevronsRightIcon = make(
  "ChevronsRightIcon",
  <>
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </>
);

export const PanelLeftIcon = make(
  "PanelLeftIcon",
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </>
);

export const LogOutIcon = make(
  "LogOutIcon",
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
);

export const PencilIcon = make(
  "PencilIcon",
  <>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </>
);

export const TrashIcon = make(
  "TrashIcon",
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>
);

export const CopyIcon = make(
  "CopyIcon",
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);

export const CheckIcon = make("CheckIcon", <path d="M20 6 9 17l-5-5" />);

export const EyeIcon = make(
  "EyeIcon",
  <>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const EyeOffIcon = make(
  "EyeOffIcon",
  <>
    <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.7 3.9" />
    <path d="M6.6 6.6A18.6 18.6 0 0 0 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.4" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </>
);

export const SearchIcon = make(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </>
);

export const PlusIcon = make(
  "PlusIcon",
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const DownloadIcon = make(
  "DownloadIcon",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </>
);

export const FileTextIcon = make(
  "FileTextIcon",
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </>
);

export const SortIcon = make(
  "SortIcon",
  <>
    <path d="M7 4v16" />
    <path d="m4 7 3-3 3 3" />
    <path d="M17 20V4" />
    <path d="m14 17 3 3 3-3" />
  </>
);

export const AlertTriangleIcon = make(
  "AlertTriangleIcon",
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);

export const InboxIcon = make(
  "InboxIcon",
  <>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
  </>
);

export const WalletIcon = make(
  "WalletIcon",
  <>
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
    <path d="M17.5 13h.01" />
  </>
);

export const BuildingIcon = make(
  "BuildingIcon",
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </>
);

export const MailIcon = make(
  "MailIcon",
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </>
);

export const PhoneIcon = make(
  "PhoneIcon",
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
);

export const MapPinIcon = make(
  "MapPinIcon",
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const HashIcon = make(
  "HashIcon",
  <>
    <path d="M4 9h16" />
    <path d="M4 15h16" />
    <path d="M10 3 8 21" />
    <path d="M16 3l-2 18" />
  </>
);

export const ArrowUpIcon = make(
  "ArrowUpIcon",
  <>
    <path d="M12 20V4" />
    <path d="m6 10 6-6 6 6" />
  </>
);

export const ArrowDownIcon = make(
  "ArrowDownIcon",
  <>
    <path d="M12 4v16" />
    <path d="m6 14 6 6 6-6" />
  </>
);

export const LayersIcon = make(
  "LayersIcon",
  <>
    <path d="m12 2.5 9 4.75-9 4.75-9-4.75Z" />
    <path d="m3 12 9 4.75L21 12" />
    <path d="m3 16.75 9 4.75 9-4.75" />
  </>
);

export const TrendingUpIcon = make(
  "TrendingUpIcon",
  <>
    <path d="m3 16 5.5-5.5 3.5 3.5L21 5" />
    <path d="M15 5h6v6" />
  </>
);
