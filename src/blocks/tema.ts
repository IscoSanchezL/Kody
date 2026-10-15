import * as Blockly from 'blockly';
import { CATEGORIAS } from './categorias';

/** Genera el estilo de un bloque a partir del color de su categoría. */
const estilo = (color: string) => ({
  colourPrimary: color,
  colourSecondary: color,
  colourTertiary: color,
});

/** Tema de Blockly de Kody: colores amigables, fuente grande y redondeada. */
export function crearTema(nombre: string, oscuro: boolean) {
  const estilos: Record<string, ReturnType<typeof estilo>> = {};
  for (const c of Object.values(CATEGORIAS)) estilos[c.id] = estilo(c.color);

  return Blockly.Theme.defineTheme(nombre, {
    name: nombre,
    base: Blockly.Themes.Classic,
    blockStyles: estilos,
    categoryStyles: Object.fromEntries(
      Object.values(CATEGORIAS).map((c) => [c.id, { colour: c.color }]),
    ),
    fontStyle: { family: 'Nunito, system-ui, sans-serif', weight: '800', size: 12 },
    componentStyles: {
      workspaceBackgroundColour: 'transparent',
      toolboxBackgroundColour: 'transparent',
      toolboxForegroundColour: oscuro ? '#dfe6ff' : '#14193d',
      flyoutBackgroundColour: oscuro ? '#101014' : '#e3e9ff',
      flyoutForegroundColour: oscuro ? '#dfe6ff' : '#14193d',
      flyoutOpacity: 1,
      scrollbarColour: oscuro ? '#8b8ba0' : '#8c9bf0',
      scrollbarOpacity: 0.7,
      insertionMarkerColour: '#ffffff',
      insertionMarkerOpacity: 0.4,
      cursorColour: '#f97316',
    },
  });
}
