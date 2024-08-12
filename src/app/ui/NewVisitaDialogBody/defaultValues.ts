import { Visitas } from "../../../../types/supabase";

export const defaultValues: Visitas = {
  date: new Date(),
  secondaryDoctor: "",
  material: "Frotis cervico vaginal",
  colpo: "",
  protocol: "C2024-",
  status: "pending",
  type: "pap",
  amount: 0,
  pap: {
    title:
      "Extendido trofico inflamatorio, compatible con cervico colpitis moderada",
    class: "II",
    evaluation: "Satisfactorio para evaluacion",
    aspect: "Inflamatorio",
    fondo: "moderada citolisis",
    flora: "Bacilos y lactobacilos",
    celPav: "Se observan cambios celulares reactivos",
    evHorm: "Extendido trofico",
    celCil: "",
  },
  silDeBajoGradoDiagnosis: {
    title:
      "Alteraciones celulares vinculables con cambios displasicos leves (sil de alto grado)",
    class: "II",
    evaluation: "Satisfactorio para evaluacion",
    aspect: "Inflamatorio",
    fondo: "moderada citolisis",
    flora: "Bacilos y lactobacilos",
    celPav: "Se observan cambios celulares reactivos",
    evHorm: "Extendido trofico",
    celCil: "",
  },
  silAltoGradoDiagnosis: {
    title:
      "Alteraciones celulares vinculables con cambios displasicos graves (sil de alto grado)",
    class: "II",
    evaluation: "Satisfactorio para evaluacion",
    aspect: "Inflamatorio",
    fondo: "moderada citolisis",
    flora: "Bacilos y lactobacilos",
    celPav: "Se observan cambios celulares reactivos",
    evHorm: "Extendido trofico",
    celCil: "",
  },
  biopsiaDiagnosis: {
    micro: "Valor por defecto para biopsia micro",
    macro: "Valor por defecto para macro de la biopsia",
  },
  cepilladoDiagnosis: {
    evaluation: "Satisfactorio para evaluacion",
    aspect: "inflamatorio",
    fondo: "mucus",
    description:
      "Los extendidos muestran células endocervicales en pequeñas planchas con cambios reactivos, componente moderadamente inflamatorio, hematíes y material mucoide.",
    title: "Cepillado endocervical, examen citologico:",
  },
  diverticuloMeckelDiagnosis: {
    micro:
      "Los cortes histológicos muestran divertículo verdadero recubierto de mucosa   de tipo intestinal, alternada con zonas de mucosa gástrica heterotópica rodeada de linfocitos. En el fondo de la formación sacular se observa esbozos de tejido pancreático heterotópico (ductos). Intenso componente  inflamatorio crónico, rico en linfocitos y células plasmáticas, que comprometen todos los cortes correspondientes a formación diverticular.",
    macro:
      "Se recibe fragmento de intestino de 8x5,5x3cm. Superficie lisa y brillante, con áreas amarillentas-grisáceos, parduscas. Al corte en zona central de la muestra, aspecto sacular, tabicado de 5cm de diámetro mayor. Contenido, escaso material semisólido color verdusco",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  polipoColonAdenomatosoDiagnosis: {
    micro:
      "Los cortes histológicos muestran mucosa colónica con cambios reactivos leves, estroma laxo. Mínimos focos superficiales que comprometen la muestra remitida en toda su extensión, con cambios adenomatosos, glándulas de luces irregulares dilatadas, revestidas de epitelio cilíndrico simple en mínimas áreas seudoestratificado, leve hipercromasia nuclear, núcleos elongados.",
    macro: "Se recibe un fragmento de tejido color blanquecino, de 0,4m IT.",
    title: "Biopsia, Colon, examen histopatológico:",
    description:
      "Hallazgos histomorfologicos vinculables con Pólipo Hiperplásico de Colon con Cambios Adenomatosos Superficiales, tipo sésil.",
  },
  polipoEndometrialCopiaDiagnosis: {
    micro:
      "Los cortes histológicos muestran de glándulas de tipo endometriales, de luces pequeñas, uniformes, epitelio columnar, escasas glándulas de luces uniformes dilatadas, vasos sanguíneos congestivos, estroma conectivo laxo, leve componente inflamatorio. Todo lo anterior circunscrito por epitelio cilíndrico simple secretor, en áreas ausente.",
    macro:
      "Se reciben múltiples fragmentos de tejido, color pardusco-blanquecino, en su totalidad miden 3x2,5cm.IT.",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  quisteDeOvarioDiagnosis: {
    micro:
      "F1) Tumor de ovario izquierdo: los cortes histológicos muestran estroma ovárico, múltiples quistes de diversas dimensiones revestidos de epitelio cubico simple, de contenido seroso y hemorrágico, de luces medianas  a grandes Extensas lagunas hemorrágicas en estroma ovario, infiltrado inflamatorio crónico, rico en linfocitos y células plasmáticas.",
    macro:
      "Tumor de ovario izquierdo: se recibe formación ovoide de tejido de 8,5x6x6,5cm  de superficie lisa, color pardo-negruzco, de consistencia elástica. Se observan dos orificios  de 1 cm de diámetro . Al corte, quístico de superficies lisas, tabicados, ocupado por material compacto de color marrón oscuro , adherido a la superficie. Pared de quiste, en su diámetro mayor 0,8mm.",
    description:
      "Hallazgos histomorfológicos vinculables con Quistes simples hemorrágicos complicados, en un contexto clínico adecuado.",
    title: "Tumor de ovario izquierdo:",
  },
  quistePilonidalDiagnosis: {
    micro: "Valor por defecto para micro del quiste pilonidal",
    macro:
      "Tumor de ovario izquierdo: se recibe formación ovoide de tejido de 8,5x6x6,5cm  de superficie lisa, color pardo-negruzco, de consistencia elástica. Se observan dos orificios  de 1 cm de diámetro . Al corte, quístico de superficies lisas, tabicados, ocupado por material compacto de color marrón oscuro , adherido a la superficie. Pared de quiste, en su diámetro mayor 0,8mm.",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  adenocaColonMucinosoDiagnosis: {
    micro:
      "Los cortes histológicos muestran proliferación tumoral conformada de glándulas atípicas de tipo intestinal, distorsionadas, irregulares, de diferentes dimensiones, revestidas de epitelio cilíndrico simple, seudo y estratificado, de macronúcleos hipercromáticos, irregulares, con pérdida de polaridad, nucleolos evidentes . En extensas áreas restos de glándulas con escaso revestimiento epitelial, luces ocupadas de material mucoide abundante, que se dispone en estroma Inter- glandular. Compromiso tumoral en capa musculara lisa del órgano, focos mínimos de infiltración en espacio subseroso. Bajo conteo mitótico. Intenso infiltrado inflamatorio en actividad, rico en polimorfonucleares neutrófilos, moderados células plasmáticas y linfocitos que se dispone alrededor de zona tumoral, reacción desmoplasica. Focos de necrosis y extensas áreas de lagunas hemáticas. Los cortes histológicos muestran en los extremos de la pieza remitida, tejido colónico de características conservadas.",
    macro: `Se recibe resección parcial de colon de 11 x 6cm. Superficie lisa y brillante con áreas parduscas, 
      
      
      
      
      
      
      congestivas, numerosos apéndices epiplóicos de color amarillento en superficie. Se observa dilatación de la pieza en parte media de 6cm de diámetro mayor. Al corte, en parte media, tumoración de 5,5x4x4cm que ocupa el 85% de la luz del órgano, de color blanquecina, con áreas pardo-amarronadas, rojizas, de aspecto mamelonado, consistencia firme, áreas friables con material de aspecto mucoide en superficie, sin perforación de la pared del órgano. Límites de resección distal y proximal a 5,5 y 6cm respectivamente impresionan sin compromiso tumoral. `,
    title: "Resección parcial de colon, examen histopatológico:",
    description:
      "Hallazgos histomorfologicos vinculables con Adenocarcinoma Mucinoso Moderadamente diferenciado de colon, tipo sésil, ulcerado de 5,5x4x4cm, sin perforación macroscópica. Márgenes de resección a 5,5 y 6cm de los márgenes distal y proximal libres de lesión. Presencia de invasión angiolinfatica. Invasión tumoral hasta subserosa. Estadio patológico: TNM: pT3, pN0.Dukes: Estadio B.",
  },
  adenocaEndometrioDiagnosis: {
    micro:
      "Los cortes histológicos muestran formación tumoral, compuesta de glándulas de tipo endometrial, de aspecto distorsionado, arboriformes, de diferentes tamaños, revestidas de epitelio seudoestratificado y en sectores de aspecto estratificado, de núcleos hipercromaticos,  pleomorficos , de nucléolos evidentes, que se limitan  a la capa endometrial del cuerpo del órgano. Estroma interglandular intensamente inflamatorio, rico en linfocitos, plasmocitos , leucocitos; congestión vascular y edema intersticial. Cuello uterino, revestido de epitelio pavimentoso adelgazado. Quistes de Naboth,  de contenido mucoide. Anexos Izquierdos y Derechos, con cambios histológicos atróficos, ambos ovarios muestran abundante estroma conectivo elástico, escasos folículos de pequeñas dimensiones, con cambios atróficos. Trompas de luces permeables. Parametrios derecho e izquierdo de vasos dilatados, congestivos.",
    macro:
      "Pieza de anexohisterectomía bilateral de 15x9 x3 cm. Cara anterior y posterior de superficie lisa y brillante. Cuello uterino de 2 cm  en su diámetro mayor, orificio cervical externo permeable ,lineal de 0,3mm, con sustancia escasa de aspecto mucoide.Al corte canal endocervicalpermeable, quistes de 0,2mm. Endometrio blanquecino de contornos irregulares, de 0,7mm en su diámetro mayor., con tejido de color parduco en luz del órgano.Fondo blanquecino, con rea irregular pardusca de 0,4 mm. Miometrio de 1,2 cm, blanquecino. Anexos Derechos: ovario de 2,5cm, superficie lisa y brillante de aspecto lobulado. Trompa uterina de 5cm de longitud, color pardusca. Anexos Izquierdos: ovario de 2,5cm, superficie lisa y brillante. Trompa uterina de 5,5cm, de superficie lisa y brillante.Al corte se observa  cuello uterino permeable, quistes de hasta 0,5mm de contenido mucoide. Endometrio  no valorable reemplazado por tejido de color blanquecino, de consistencia blanda , friable, de 1,4 mm en su diámetro mayor. Miometrio adelgazado de hasta 0,5mm.",
    title:
      "Biopsia de pieza de Anexohisterectomía  Bilateral, examen histopatológico:",
    description:
      "Adenocarcinoma de endometrio tipo Endometroide extenso de endometrio, multifocal, bien diferenciado, grado arquitectural I y grado nuclear I, con invasión superficial del miometrio, sin infiltración del canal cervical, sin invasión vascular o linfática. Trompas y ovarios derechos e izquierdos con cambios atróficos acordes edad. Parametrios derecho e izquierdo libres de tumor. Cervicitis superficial leve. Quistes de Naboth. Ovarios derecho e izquierdo con cambios atróficos. Estadificación patológica (TNM Y FIGO): Pt1a-IA –TUMOR LIMITADO AL ENDOMETRIO.",
  },
  condilomasMultiplesDiagnosis: {
    micro:
      "F1: Cuello uterino: los cortes histológicos muestran cuello uterino de epitelio pavimentoso estratificado, leve hiperplasia de capa basal. Células coilociticas de núcleos irregulares, hipercromáticos, halos claros, retracción nuclear, en capas superiores. Corion levemente inflamatorio. Se observa mínimos coilocitos irregulares,  en capa media. F2: Vagina (lado derecho): Ambas muestran presenta epitelio pavimentoso estratificado, leve hiperplasia de capa basal, coilocitos de núcleos irregulares, binucleaciones, halos claros, núcleos atriccionados. F3: Región perineal (lado izquierdo): Los cortes histológicos muestran epitelio pavimentoso estratificado, intensa hiperplasia de capa basal y extensa papilomatosis, células poligonales de núcleos grandes, hipercromáticos, perdida de relación núcleo/citoplasma, escasas mitosis. F4: Horquilla Vulvar: Los cortes histológicos muestran epitelio plano estratificado, marcada acantosis, papilomatosis y leve hiperqueratosis. Presencia de coilocitos vacuolados en capas superficiales. Gránulos de queratohialina. Estroma subyacente, rico en vasos sanguíneos congestivos. F5: Región paravulvar izquierda: Los cortes histológicos muestran acantosis, hiperplasia de capa basal, moderada papilomatosis, hiperqueratosis leve. Alteración de la maduración celular, macronúcleos, irregulares, de cromatina gruesa, hipercromasia, alteración de relacion núcleo/ citoplasma.",
    macro:
      "Se reciben cinco frascos identificados que se enumeran en forma arbitraria: F1: Cuello uterino: se reciben dos fragmentos de tejido, color pardusco, el mayor de 0,3 mm.IT. F2: Vagina (lado derecho): dos fragmentos de tejido, blanquecinos, el mayor de 0,4mm. IT. F3: Región perineal (lado izquierdo): un fragmento de tejido de tejido blanquecino-pardusco de 0,5mm.IT F4: Horquilla Vulvar: un fragmento de tejido color blanquecino de 0,3mm.IT F5: Región paravulvar izquierda: se reciben dos fragmentos de tejido color pardusco, el mayor de 0,4mm.IT",
    title: "Biopsias, examen histopatológico:",
    description:
      "1) Cuello uterino: Hallazgos histomorfologicos vinculables con Cambios Displásicos Leves (Sil de Bajo Grado). 2) Vagina (lado derecho): Hallazgos histomorfologicos vinculables con Neoplasia Intraepitelial leve (VAIN I). 3) Región Perineal (lado izquierdo): Hallazgos histomorfologicos vinculables con Condiloma acuminado con cambios displásicos moderados. 4) Horquilla Vulvar: Hallazgos histomorfologicos vinculables con Condiloma acuminado. 5) Región paravulvar (izquierda): Hallazgos histomorfologicos vinculables con Neoplasia Vulvar Intraepitelial moderada( VIN II)",
  },

  conoSilBajoGradoDiagnosis: {
    micro:
      "Cono de Cuello Uterino: Se realizan cortes seriados de pieza recibida. Se observa en todos los cuadrantes A,B,C y D, epitelio de revestimiento pavimentoso estratificado, leve hiperplasia de capa basal, células coilociticas , de núcleos retraídos y levemente hipercromaticos   que se disponen en las capas superiores del epitelio. Corion subyacente moderadamente inflamatorio, componente glandular endocervical, con cambios reactivos. Áreas de transición de epitelios con cambios displasicos leves y áreas puntiformes coilociticas en hora 3 a 9, de epitelio adelgazado y compromiso marcado de  epiteliales superiores.",
    macro:
      "Se recibe pieza de conización de 1,6x1,4x0,3 cm. Superficie lisa y brillante, color blanquecino, de consistencia elástica. Orificio cervical externo permeable de 0,3mm de diámetro. Pieza señalizada en hora 12. Se divide la pieza  en cuatro cuadrantes  A,B,C Y D y se realizan cortes seriados con inclusión total del material. IT",
    title: "Cono-Cervix, hallazgos histomorfologicos vinculables con:",
    description:
      "Cervicitis Superficial Moderada con focos de  Displasia Leve ( Sil de bajo grado). ",
  },
  conoSilAltoGradoDiagnosis: {
    micro:
      "Cono/Leep,Cuello Uterino: Se realizan cortes seriados de pieza recibida. Se observa en los cuadrantes D y A ( Hora 9 A 3), epitelio de revestimiento pavimentoso estratificado, marcada hiperplasia de capa basal, papilomatosis, cambios coilociticos atípicos, micro y macronúcleos, retracción nuclear, moderada a intensa hipercromasia, halos en semiluna, bordes nucleares irregulares, perdida de polaridad nuclear y maduración del epitelio, que afectan capas superiores y media;  en mínimos focos se observa afectación de todo el estrato epitelial. El resto de los cuadrantes B y C (hora 3 a 9) presentan cambios coilociticos atípicos virales dispuestos en estratos superiores. Corion subyacente moderadamente inflamatorio, componente glandular endocervical, con cambios reactivos; quistes simples ; mínimos focos de relleno glandular endocervical con cambios displásicos moderados. Áreas de transición de epitelios con cambios displásicos leves a moderados.",
    macro:
      "Se recibe pieza de conización (Leep), dimensiones 2x2x0,5 cm, señalización hora 12. Superficie lisa y brillante, color blanquecino, de consistencia elástica. Orificio cervical externo permeable de 0,5mm. Se divide la pieza en cuatro cuadrantes A, B, C Y D y se realizan cortes seriados con inclusión total del material",
    title: "CONO-LEEP (CERVIX)- EXAMEN HISTOPATOLOGICO:",
    description:
      "Hallazgos histomorfologicos vinculables con:-Cervicitis Superficial Leve. -Cambios Displásicos Moderados a Severos (Sil de Alto Grado)- HSIL - Cambios Displásicos leves - LSIL - Endocervicitis moderada. Quistes de Naboth. Márgenes de resección laterales y en profundidad: Libres de lesión.",
  },
  corangiosisPlacentariaDiagnosis: {
    micro: "Valor por defecto para micro de la caroangiosis placentaria",
    macro: "Valor por defecto para macro de la caroangiosis placentaria",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },

  lipomaDiagnosis: {
    micro: "Valor por defecto para micro del elDipoma",
    macro: "Valor por defecto para macro del elDipoma",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  queratiosisSeborreicaDiagnosis: {
    micro: "Valor por defecto para micro de la queratiosis seborreica",
    macro: "Valor por defecto para macro de la queratiosis seborreica",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  vulvaDiagnosis: {
    micro: "Valor por defecto para micro de la vulva",
    macro: "Valor por defecto para macro de la vulva",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  apendicitisGangrenosaDiagnosis: {
    micro: "Valor por defecto para micro de la apendice gangrenosa",
    macro: "Valor por defecto para macro de la apendice gangrenosa",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  basocelularDiagnosis: {
    micro: "Valor por defecto para micro del basocelular",
    macro: "Valor por defecto para macro del basocelular",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  colecistitisAgudaDiagnosis: {
    micro: "Valor por defecto para micro de la colecistitis aguda",
    macro: "Valor por defecto para macro de la colecistitis aguda",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  condilomaAcuminadoDiagnosis: {
    micro: "Valor por defecto para micro del condiloma acuminado",
    macro: "Valor por defecto para macro del condiloma acuminado",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  cuelloEndocervixDiagnosis: {
    micro: "Valor por defecto para micro del cuello endocérvix",
    macro: "Valor por defecto para macro del cuello endocérvix",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  cuelloVaginaDiagnosis: {
    micro: "Valor por defecto para micro del cuello vagina",
    macro: "Valor por defecto para macro del cuello vagina",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  estomagoPolipoRectoDiagnosis: {
    micro: "Valor por defecto para micro del estómago pólipo recto",
    macro: "Valor por defecto para macro del estómago pólipo recto",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  gastritisDiagnosis: {
    micro: "Valor por defecto para micro de la gastritis",
    macro: "Valor por defecto para macro de la gastritis",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  hemoroidesDiagnosis: {
    micro: "Valor por defecto para micro de las hemorroides",
    macro: "Valor por defecto para macro de las hemorroides",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  hstBilateralMiomasDiagnosis: {
    micro: "Valor por defecto para micro de los miomas bilaterales",
    macro: "Valor por defecto para macro de los miomas bilaterales",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  hstTotalMasAnexosPolipoEndometrioDiagnosis: {
    micro: "Valor por defecto para micro de anexos pólipo endometrio",
    macro: "Valor por defecto para macro de anexos pólipo endometrio",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  infartoIntestinalDiagnosis: {
    micro: "Valor por defecto para micro del infarto intestinal",
    macro: "Valor por defecto para macro del infarto intestinal",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  placentaHematomaRetroDiagnosis: {
    micro: "Valor por defecto para micro del hematoma retroplacentario",
    macro: "Valor por defecto para macro del hematoma retroplacentario",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  placentaHTADiagnosis: {
    micro: "Valor por defecto para micro de la placenta HTA",
    macro: "Valor por defecto para macro de la placenta HTA",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  polipoEndometrioDiagnosis: {
    micro: "Valor por defecto para micro del pólipo endometrio",
    macro: "Valor por defecto para macro del pólipo endometrio",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  verrugaVulgarDeVulvaDiagnosis: {
    micro: "Valor por defecto para micro de la verruga vulgar",
    macro: "Valor por defecto para macro de la verruga vulgar",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  polipoEstomagoYEstomagoDiagnosis: {
    micro: "Valor por defecto para micro del pólipo de estómago",
    macro: "Valor por defecto para macro del pólipo de estómago",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  quisteDeInclusionEpidDiagnosis: {
    micro: "Valor por defecto para micro del quiste de inclusión epidérmico",
    macro: "Valor por defecto para macro del quiste de inclusión epidérmico",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  tejidoNecroticoDiagnosis: {
    micro: "Valor por defecto para micro del tejido necrótico",
    macro: "Valor por defecto para macro del tejido necrótico",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  ulceraGastricaDiagnosis: {
    micro: "Valor por defecto para micro de la úlcera gástrica",
    macro: "Valor por defecto para macro de la úlcera gástrica",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  mamaFibroadenomaDiagnosis: {
    micro: "Valor por defecto para micro del fibroadenoma de mama",
    macro: "Valor por defecto para macro del fibroadenoma de mama",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  partesBlandasDiagnosis: {
    micro: "Valor por defecto para micro de las partes blandas",
    macro: "Valor por defecto para macro de las partes blandas",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  pielDiagnosis: {
    micro: "Valor por defecto para micro de la piel",
    macro: "Valor por defecto para macro de la piel",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  pielNevusDiagnosis: {
    micro: "Valor por defecto para micro del nevus de piel",
    macro: "Valor por defecto para macro del nevus de piel",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  placentaDiagnosis: {
    micro: "Valor por defecto para micro de la placenta",
    macro: "Valor por defecto para macro de la placenta",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  placentaAcretaDiagnosis: {
    micro: "Valor por defecto para micro de la placenta ácreta",
    macro: "Valor por defecto para macro de la placenta ácreta",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  polipoColonDiagnosis: {
    micro: "Valor por defecto para micro del pólipo de colon",
    macro: "Valor por defecto para macro del pólipo de colon",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  polipoEndocervicalDiagnosis: {
    micro: "Valor por defecto para micro del pólipo endocervical",
    macro: "Valor por defecto para macro del pólipo endocervical",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  prolapsoDiagnosis: {
    micro: "Valor por defecto para micro del prolapso",
    macro: "Valor por defecto para macro del prolapso",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  restosPlacentariosDiagnosis: {
    micro: "Valor por defecto para micro de los restos placentarios",
    macro: "Valor por defecto para macro de los restos placentarios",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  vaginaDiagnosis: {
    micro: "Valor por defecto para micro de la vagina",
    macro: "Valor por defecto para macro de la vagina",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  vesiculaDiagnosis: {
    micro: "Valor por defecto para micro de la vesícula",
    macro: "Valor por defecto para macro de la vesícula",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  endocervixYEndometrioDiagnosis: {
    micro: "Valor por defecto para micro del endocérvix y endometrio",
    macro: "Valor por defecto para macro del endocérvix y endometrio",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  endometrioDiagnosis: {
    micro: "Valor por defecto para micro del endometrio",
    macro: "Valor por defecto para macro del endometrio",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  endometrioDisgregadoDiagnosis: {
    micro: "Valor por defecto para micro del endometrio disgregado",
    macro: "Valor por defecto para macro del endometrio disgregado",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  estomagoYDuodenoDiagnosis: {
    micro: "Valor por defecto para micro del estómago y duodeno",
    macro: "Valor por defecto para macro del estómago y duodeno",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  extraccionDiuDiagnosis: {
    micro: "Valor por defecto para micro de la extracción de DIU",
    macro: "Valor por defecto para macro de la extracción de DIU",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  fibromaBlandoDiagnosis: {
    micro: "Valor por defecto para micro del fibroma blando",
    macro: "Valor por defecto para macro del fibroma blando",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  granulomaDeVaginaDiagnosis: {
    micro: "Valor por defecto para micro del granuloma de vagina",
    macro: "Valor por defecto para macro del granuloma de vagina",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  histerectomiaSimpleDiagnosis: {
    micro: "Valor por defecto para micro de la histerectomía simple",
    macro: "Valor por defecto para macro de la histerectomía simple",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  leiomiomaHipercelularDiagnosis: {
    micro: "Valor por defecto para micro del leiomioma hipercelular",
    macro: "Valor por defecto para macro del leiomioma hipercelular",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  liquidoPeritonealDiagnosis: {
    micro: "Valor por defecto para micro del líquido peritoneal",
    macro: "Valor por defecto para macro del líquido peritoneal",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  liquidoPleuralDiagnosis: {
    micro: "Valor por defecto para micro del líquido pleural",
    macro: "Valor por defecto para macro del líquido pleural",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  tiroidesDiagnosis: {
    micro: "Valor por defecto para micro de la tiroides",
    macro: "Valor por defecto para macro de la tiroides",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  marshTipo3CeliaquiaDiagnosis: {
    micro: "Valor por defecto para micro del tipo 3aB de mama",
    macro: "Valor por defecto para macro del tipo 3aB de mama",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  metaplasiaIntestinalDiagnosis: {
    micro: "Valor por defecto para micro de la metaplasia intestinal",
    macro: "Valor por defecto para macro de la metaplasia intestinal",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  moluscoContagiosoDiagnosis: {
    micro: "Valor por defecto para micro del molusco contagioso",
    macro: "Valor por defecto para macro del molusco contagioso",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  paafDeMamaDiagnosis: {
    micro: "Valor por defecto para micro del PAAF de mama",
    macro: "Valor por defecto para macro del PAAF de mama",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
  placentaEnvejecimientoPlacentarioDiagnosis: {
    micro: "Valor por defecto para micro del envejecimiento placentario",
    macro: "Valor por defecto para macro del envejecimiento placentario",
    title: "Tumor de ovario izquierdo:",
    description:
      "Hallazgos histomorfologicos vinculables con Divertículo de Meckel con compromiso inflamatorio crónico intenso.",
  },
};
