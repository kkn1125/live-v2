// declare interface EnterButtonType {
//   color?:
//     | "inherit"
//     | "primary"
//     | "secondary"
//     | "success"
//     | "error"
//     | "info"
//     | "warning"
//     | undefined;
//   variant?: "text" | "outlined" | "contained" | undefined;
//   children?: React.ReactElement | React.ReactElement[] | string | undefined;
// }

declare interface EnterAnswerType {
  title?: string | React.ReactElement | React.ReactElement[];
  content?: string | React.ReactElement | React.ReactElement[];
  to?: string;
}

declare interface EnterDialogType extends EnterAnswerType {
  open: boolean;
  handleClose: () => void;
}

declare interface VideoJSType {
  playerRef: React.MutableRefObject<Player>;
  options: {
    autoplay: boolean;
    controls: boolean;
    responsive: boolean;
    fluid: boolean;
    sources?: { src: string; type: string }[];
  };
  onReady: (player?: Player) => void;
  mediaSource?: MediaSource;
  // admin?: boolean;
}
