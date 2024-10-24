export interface Layer {
  meta: any;
  id: string;
  name?: string;
  visible: boolean;
  opacity: number;
  content: any;
  zIndex: number;
  activityId: string; 
  cfg?: {
    position?: any;
    rotation?: any;
    scale?: any;
  };
}
