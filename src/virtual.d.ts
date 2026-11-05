declare module 'virtual:scam-videos' {
  export interface ScamVideoItem {
    title: string;
    src: string;
    badge: string;
    filename: string;
    fallbackSrc?: string;
  }
  export const SCAM_VIDEOS: ScamVideoItem[];
}
