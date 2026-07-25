declare module 'text-readability' {
  function fleschReadingEase(text: string): number;
  function fleschKincaidGrade(text: string): number;
  function gunningFog(text: string): number;
  function daleChallReadabilityScore(text: string): number;
  function automatedReadabilityIndex(text: string): number;
  function colemanLiauIndex(text: string): number;
  function linsearWriteFormula(text: string): number;
  function smogIndex(text: string): number;
  function textStandard(text: string): string;
  export = {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    daleChallReadabilityScore,
    automatedReadabilityIndex,
    colemanLiauIndex,
    linsearWriteFormula,
    smogIndex,
    textStandard,
  };
}
