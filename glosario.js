// Glosario: explicaciones simples de los términos que aparecen en la app.
// Cada término tiene: id, título, resumen (una línea) y explicación (texto simple).
window.GLOSARIO = [
  {
    id: "cedear",
    titulo: "CEDEAR",
    resumen: "Una forma de comprar acciones de afuera desde Argentina.",
    texto: "Un CEDEAR es un certificado que cotiza en la bolsa argentina y representa una parte de una acción o fondo de Estados Unidos (como Apple o el SPY). Lo comprás en pesos o en dólares desde Cocos, sin abrir una cuenta en el exterior. Su precio sigue a la acción original y también al dólar CCL, por eso en pesos suele subir cuando sube el dólar."
  },
  {
    id: "etf",
    titulo: "ETF (fondo que cotiza)",
    resumen: "Una canasta de muchas acciones que comprás de una sola vez.",
    texto: "Un ETF es un fondo que junta muchas acciones y se compra y vende como si fuera una sola. En vez de elegir empresa por empresa, comprás un pedacito de todas. El SPY es un ETF: con uno solo tenés un poquito de las 500 empresas más grandes de Estados Unidos."
  },
  {
    id: "spy",
    titulo: "SPY / S&P 500",
    resumen: "Un fondo que replica a las 500 empresas más grandes de EE.UU.",
    texto: "El S&P 500 es un índice: una lista de las 500 empresas más grandes de Estados Unidos (Apple, Microsoft, Nvidia, Amazon y muchas más). El SPY es un fondo que copia ese índice. Si a esas empresas en conjunto les va bien, el SPY sube. Es de las inversiones más usadas para el largo plazo porque reparte el riesgo entre muchas empresas y cobra comisiones muy bajas."
  },
  {
    id: "precio-promedio",
    titulo: "Precio promedio",
    resumen: "Lo que pagaste, en promedio, por cada unidad que tenés.",
    texto: "Si compraste en distintas fechas a distintos precios, el precio promedio es lo que te costó cada unidad en promedio. Ejemplo: compraste 1 a US$10 y 1 a US$12, tu promedio es US$11. Sirve para saber si vas ganando: si el precio de hoy está por encima de tu promedio, vas ganando."
  },
  {
    id: "no-realizada",
    titulo: "Ganancia no realizada",
    resumen: "Lo que ganarías si vendieras hoy. Todavía no es plata en mano.",
    texto: "Es la diferencia entre lo que vale hoy lo que tenés y lo que pagaste. Se llama 'no realizada' porque todavía no vendiste: si mañana el precio baja, esa ganancia puede achicarse o desaparecer. No es mala ni buena por sí sola; es una foto del momento."
  },
  {
    id: "realizada",
    titulo: "Ganancia realizada",
    resumen: "Lo que ya ganaste (o perdiste) al vender o cobrar dividendos.",
    texto: "Cuando vendés, la diferencia entre el precio de venta y tu precio promedio pasa a ser ganancia realizada: ya está 'cerrada' y no cambia aunque el precio se mueva después. Los dividendos cobrados también suman acá."
  },
  {
    id: "rendimiento",
    titulo: "Rendimiento",
    resumen: "Cuánto creció tu plata, en porcentaje.",
    texto: "El rendimiento es la ganancia expresada en porcentaje de lo que pusiste. Si invertiste US$100 y ahora tenés US$105, tu rendimiento es +5%. Sirve para comparar inversiones de distinto tamaño."
  },
  {
    id: "pesos-vs-dolares",
    titulo: "¿Por qué gano distinto en pesos y en dólares?",
    resumen: "Porque en pesos también cuenta cuánto subió el dólar.",
    texto: "Tu ganancia en dólares muestra solo cuánto subieron tus inversiones. En pesos, además, se suma lo que subió el dólar: si el dólar pasó de $1.470 a $1.550, todo lo que está en dólares vale más pesos aunque la acción no se haya movido. Para saber si realmente ganaste, mirá la ganancia en dólares. La de pesos te dice si le ganaste al dólar."
  },
  {
    id: "ccl",
    titulo: "Dólar CCL (contado con liquidación)",
    resumen: "El dólar que se usa para pasar de pesos a CEDEARs y viceversa.",
    texto: "Es un tipo de dólar que sale de comprar algo en pesos en Argentina y venderlo en dólares afuera. Los CEDEARs se mueven con este dólar: su precio en pesos es aproximadamente el precio en dólares por el CCL. La app lo trae sola de internet para calcular cuánto vale tu cartera en pesos."
  },
  {
    id: "mep",
    titulo: "Dólar MEP",
    resumen: "El dólar 'bolsa' que se compra con pesos y queda en Argentina.",
    texto: "Es otra forma legal de comprar dólares a través de la bolsa, que te quedan en una cuenta en Argentina. Suele tener un precio parecido al CCL. En Cocos podés comprar dólar MEP para después invertir en dólares."
  },
  {
    id: "dividendo",
    titulo: "Dividendo",
    resumen: "Parte de las ganancias que una empresa o fondo reparte.",
    texto: "Algunas empresas y fondos reparten plata a quienes los tienen, cada cierto tiempo. El SPY paga cuatro veces por año, alrededor de 1% anual en total. Por tener CEDEARs, en Estados Unidos te retienen parte (suele ser 30%), por eso a veces el monto que llega es muy chico."
  },
  {
    id: "diversificacion",
    titulo: "Diversificación",
    resumen: "No poner todos los huevos en la misma canasta.",
    texto: "Diversificar es repartir la plata en distintas inversiones para que, si una anda mal, no arrastre todo. El SPY ya está diversificado entre 500 empresas, pero todas son de Estados Unidos y muchas son tecnológicas."
  },
  {
    id: "volatilidad",
    titulo: "Volatilidad",
    resumen: "Cuánto sube y baja algo de un día para otro.",
    texto: "Una inversión volátil cambia mucho de precio en poco tiempo. Las acciones son más volátiles que un plazo fijo. Que algo baje un día no significa que esté mal: en el largo plazo lo que importa es la tendencia. Si los movimientos te quitan el sueño, puede que te convenga algo menos volátil."
  },
  {
    id: "riesgo",
    titulo: "Riesgo",
    resumen: "La posibilidad de que la inversión valga menos de lo que pagaste.",
    texto: "Toda inversión tiene riesgo. En general, lo que puede rendir más también puede caer más. El S&P 500 tuvo caídas de 20% a 35% en crisis (2008, 2020, 2022) y después se recuperó, pero eso llevó meses o años. Por eso conviene invertir plata que no vas a necesitar pronto."
  },
  {
    id: "horizonte",
    titulo: "Horizonte de inversión",
    resumen: "Cuánto tiempo pensás dejar la plata invertida.",
    texto: "Es el plazo que le das a tu inversión. Para acciones y fondos como el SPY se suele pensar en años, no en semanas, porque así hay tiempo de recuperarse de las caídas. Plata que vas a usar en pocos meses suele ir a opciones más estables."
  },
  {
    id: "interes-compuesto",
    titulo: "Interés compuesto",
    resumen: "Ganar sobre lo que ya ganaste.",
    texto: "Si dejás invertida la ganancia, el año siguiente ganás sobre un monto más grande. Con el tiempo, ese efecto se acumula como una bola de nieve. Por eso invertir de a poco pero constante, y durante muchos años, suele dar buenos resultados."
  },
  {
    id: "liquidez",
    titulo: "Liquidez",
    resumen: "Qué tan rápido convertís una inversión en plata disponible.",
    texto: "Algo es líquido si lo podés vender rápido y a buen precio. El SPY es muy líquido: lo vendés en segundos. Un plazo fijo es menos líquido porque tenés que esperar a que venza."
  },
  {
    id: "plazo-24hs",
    titulo: "\"En 24hs\" (plazo de liquidación)",
    resumen: "Cuándo se termina de pagar y acreditar la operación.",
    texto: "Cuando comprás o vendés en la bolsa, la plata y los títulos se acreditan en un plazo. 'En 24hs' significa que la operación se completa al día hábil siguiente. 'Contado inmediato' (CI) se acredita en el día."
  },
  {
    id: "money-market",
    titulo: "Fondo money market",
    resumen: "Un fondo muy estable para tener pesos disponibles rindiendo algo.",
    texto: "Es un fondo común de inversión que invierte en cosas muy seguras y de corto plazo. Rinde poco pero todos los días, y podés sacar la plata cuando quieras. Sirve para no tener pesos quietos en la cuenta mientras decidís qué hacer."
  },
  {
    id: "fci",
    titulo: "Fondo común de inversión (FCI)",
    resumen: "Juntás tu plata con la de otros y un profesional la invierte.",
    texto: "En un FCI comprás 'cuotapartes' de un fondo que maneja un equipo profesional. Hay fondos de distinto riesgo: money market (muy estable), renta fija (bonos) y renta variable (acciones). En Cocos están en la sección Fondos."
  },
  {
    id: "inflacion",
    titulo: "Inflación",
    resumen: "La suba general de precios: hace que los pesos compren menos.",
    texto: "Si la inflación del año fue 30%, necesitás que tu plata crezca al menos 30% en pesos para no perder poder de compra. Por eso mucha gente invierte en cosas que siguen al dólar o rinden más que la inflación."
  },
  {
    id: "comisiones",
    titulo: "Comisiones",
    resumen: "Lo que te cobran por operar o por administrar un fondo.",
    texto: "El bróker puede cobrarte un porcentaje cada vez que comprás o vendés, y además están los derechos de mercado. Los fondos cobran una comisión anual. Comprar y vender muy seguido hace que las comisiones se coman parte de la ganancia."
  },
  {
    id: "merval",
    titulo: "Merval",
    resumen: "El índice de las principales acciones argentinas.",
    texto: "Es como el S&P 500 pero de Argentina: agrupa a las empresas más importantes que cotizan acá (Galicia, YPF, Pampa y otras). Suele moverse mucho más que el S&P 500, para arriba y para abajo."
  },
  {
    id: "cartera",
    titulo: "Cartera",
    resumen: "Todo lo que tenés invertido más tu efectivo.",
    texto: "Tu cartera es el conjunto de tus inversiones y la plata disponible en la cuenta. La app suma todo y te muestra cuánto vale hoy, en pesos y en dólares."
  }
];
