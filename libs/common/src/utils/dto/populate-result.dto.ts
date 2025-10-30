export interface PopulateResultDto {
  [resourceType: string]: {
    [resourceId: string]: any;
  };
}
