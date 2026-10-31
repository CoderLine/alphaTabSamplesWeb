// Parcel's `worklet:` imports resolve to the URL of the bundled worklet.
declare module 'worklet:*' {
  const url: string;
  export default url;
}
