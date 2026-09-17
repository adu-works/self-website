/** Shared action labels and keyboard routing; game shortcuts never consume form input. */
export const actionKeys={ 'open-furnace':'E',hammer:'E','take-shovel':'E',dig:'E','open-chest':'E',configure:'E','open-hatch':'E',board:'E',launch:'E',carry:'F','put-down':'R',smash:'X','walk-dig':'G','walk-ship':'G' };
export function shortcutAction(event,available,blocked=false){
 if(blocked||event.repeat||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return null;
 const key=event.key.toUpperCase();
 return available.find(action=>actionKeys[action]===key)||null;
}
