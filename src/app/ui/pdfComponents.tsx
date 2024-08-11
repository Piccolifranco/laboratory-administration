import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";
import {
  Visitas,
  Paciente,
  BiopsiaDiagnosisBase,
  PapDiagnosis,
  PapVisita,
  BiopsiaVisita,
} from "../../../types/supabase"; // Importa tus tipos definidos

// Define estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    textAlign: "center",
  },
  content: {
    fontSize: 12,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    margin: 14,
  },
  field: {
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold",
  },
  headerBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 20,
    marginBottom: 10,
  },
  secret: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    margin: 5,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  svgContainer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

// Componente para el diagnóstico de Papanicolau
const PapDiagnosisComponent = ({
  paciente,
  visita,
}: {
  paciente: Paciente;
  visita: PapVisita;
}) => (
  <Page style={styles.page}>
    <View style={styles.headerBox}>
      <Text style={[styles.title, styles.bold]}>
        ANATOMIA PATOLOGICA GENERAL, PEDIATRICA Y CITOLOGIA
      </Text>
      <Text style={styles.title}>Dra Carolina Lorena Vadillo MPN: 4416</Text>
      <Text style={styles.text}>
        Consultorios Güemes. Remedios de Escalada 599.
      </Text>
      <Text style={styles.text}>
        Chaco, Resistencia. Telefono: 0362-4413405.
      </Text>
    </View>
    <View style={styles.section}>
      <View style={styles.field}>
        <Text style={styles.secret}>INFORME CONFIDENCIAL. SECRETO MÉDICO.</Text>
        <Text style={styles.secret}>
          ALCANCES DEL ART. 156 DEL CÓDIGO PENAL.
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.flex}>
          <Text style={styles.content}>
            Nombre y apellido: {paciente.lastName} {paciente.firstName}
          </Text>
          <Text style={styles.content}>Edad: {paciente.age} años</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>
            Doctor/a:{" "}
            {visita.secondaryDoctor ? visita.secondaryDoctor : paciente.doctor}
          </Text>
          <Text style={styles.content}>Protocolo: {visita.protocol}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>Material: {visita.material}</Text>
          <Text style={styles.content}>
            Fecha: {new Date(visita.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>Colpo: {visita.colpo}</Text>
          <Text style={styles.content}>OS: {paciente.obraSocial}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>
        Informe citológico (modificado de Sistema Bethesda Papanicolaou)
      </Text>
      <Text style={[styles.title, styles.bold]}>ADECUACION DEL ESPECIMEN</Text>
      <Text style={styles.content}>{visita[visita.type]?.evaluation}</Text>
      <Text style={styles.content}>Aspecto: {visita[visita.type]?.aspect}</Text>
      <Text style={styles.content}>Fondo: {visita[visita.type]?.fondo}</Text>

      <Text style={[styles.title, styles.bold]}>DIAGNOSTICO DESCRIPTIVO</Text>
      <Text style={styles.content}>Flora: {visita[visita.type]?.flora}</Text>
      <Text style={styles.content}>
        Evaluación de células pavimentosas: {visita[visita.type]?.celPav}
      </Text>
      <Text style={styles.content}>
        Evaluación hormonal: {visita[visita.type]?.evHorm}
      </Text>
      <Text style={styles.content}>
        Evaluación de células cilíndricas: {visita[visita.type]?.celCil}
      </Text>

      <Text style={[styles.title, styles.bold]}>DIAGNOSTICO</Text>
      <Text style={styles.content}>{visita[visita.type]?.title}</Text>
      <Text style={styles.content}>
        Pap clase: {visita[visita.type]?.class}
      </Text>
      <Text style={styles.content}>Notas: {visita[visita.type]?.notes}</Text>
    </View>
  </Page>
);

const CepilladoDiagnosisComponent = ({
  paciente,
  visita,
}: {
  paciente: Paciente;
  visita: Visitas;
}) => (
  <Page style={styles.page}>
    <View style={styles.headerBox}>
      <Text style={[styles.title, styles.bold]}>
        ANATOMIA PATOLOGICA GENERAL, PEDIATRICA Y CITOLOGIA
      </Text>
      <Text style={styles.title}>Dra Carolina Lorena Vadillo MPN: 4416</Text>
      <Text style={styles.text}>
        Consultorios Güemes. Remedios de Escalada 599.
      </Text>
      <Text style={styles.text}>
        Chaco, Resistencia. Telefono: 0362-4413405.
      </Text>
    </View>
    <View style={styles.section}>
      <View style={styles.field}>
        <Text style={styles.secret}>INFORME CONFIDENCIAL. SECRETO MÉDICO.</Text>
        <Text style={styles.secret}>
          ALCANCES DEL ART. 156 DEL CÓDIGO PENAL.
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.flex}>
          <Text style={styles.content}>
            Nombre y apellido: {paciente.lastName} {paciente.firstName}
          </Text>
          <Text style={styles.content}>Edad: {paciente.age} años</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>
            Doctor/a:{" "}
            {visita.secondaryDoctor ? visita.secondaryDoctor : paciente.doctor}
          </Text>
          <Text style={styles.content}>Protocolo: {visita.protocol}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>Material: {visita.material}</Text>
          <Text style={styles.content}>
            Fecha: {new Date(visita.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.content}>Colpo: {visita.colpo}</Text>
          <Text style={styles.content}>OS: {paciente.obraSocial}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>
        Informe citológico (modificado de Sistema Bethesda Papanicolaou)
      </Text>
      <Text style={[styles.title, styles.bold]}>ADECUACION DEL ESPECIMEN</Text>
      <Text style={styles.content}>{visita.cepilladoDiagnosis.evaluation}</Text>
      <Text style={styles.content}>
        Aspecto: {visita.cepilladoDiagnosis.aspect}
      </Text>
      <Text style={styles.content}>
        Fondo: {visita.cepilladoDiagnosis.fondo}
      </Text>

      <Text style={[styles.title, styles.bold]}>DIAGNOSTICO DESCRIPTIVO</Text>
      <Text style={styles.content}>
        Flora: {visita.cepilladoDiagnosis.description}
      </Text>

      <Text style={[styles.title, styles.bold]}>DIAGNOSTICO</Text>
      <Text style={styles.content}>{visita.cepilladoDiagnosis.title}</Text>
      <Text style={styles.content}>
        Notas: {visita.cepilladoDiagnosis.notes}
      </Text>
    </View>
    <View style={styles.svgContainer}>
      <Svg viewBox="0 0 1060 897" style={{ width: 800, height: 800 }}>
        <Path
          d="M6009 7925 c-25 -13 -57 -70 -47 -80 3 -3 -11 -22 -31 -43 -30 -33 -35 -35 -79 -30 -66 9 -112 -9 -162 -62 -40 -42 -49 -58 -69 -124 -22 -73 -25 -101 -24 -230 0 -128 3 -157 22 -205 32 -84 62 -113 120 -113 68 0 84 18 98 107 19 124 27 144 73 160 23 8 57 22 77 30 23 10 37 21 37 30 0 7 15 18 33 24 18 7 67 36 108 65 57 40 83 51 105 47 28 -5 31 -10 41 -73 14 -95 26 -110 95 -110 59 0 80 22 97 103 19 88 24 94 71 94 52 0 80 24 111 96 22 50 29 84 28 131 -2 91 -40 177 -92 203 -33 16 -75 14 -116 -6 -36 -18 -65 -63 -65 -102 0 -22 -12 -25 -96 -25 -56 0 -100 -4 -99 -10 0 -6 -4 -10 -9 -10 -5 0 -13 -9 -18 -20 -8 -17 -13 -16 -67 9 -77 36 -126 45 -172 35 -19 -4 -49 0 -70 8 -44 18 -69 18 -98 1z"
          fill="#000000"
        />
      </Svg>
    </View>
  </Page>
);

// Componente para el diagnóstico de Biopsia
const BiopsiaDiagnosisComponent = ({
  paciente,
  visita,
}: {
  paciente: Paciente;
  visita: BiopsiaVisita;
}) => {
  return (
    <Page style={styles.page}>
      <View style={styles.headerBox}>
        <Text style={[styles.title, styles.bold]}>
          ANATOMIA PATOLOGICA GENERAL, PEDIATRICA Y CITOLOGIA
        </Text>
        <Text style={styles.title}>Dra Carolina Lorena Vadillo MPN: 4416</Text>
        <Text style={styles.text}>
          Consultorios Güemes. Remedios de Escalada 599.
        </Text>
        <Text style={styles.text}>
          Chaco, Resistencia. Telefono: 0362-4413405.
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.field}>
          <Text style={styles.secret}>
            INFORME CONFIDENCIAL. SECRETO MÉDICO.
          </Text>
          <Text style={styles.secret}>
            ALCANCES DEL ART. 156 DEL CÓDIGO PENAL.
          </Text>
        </View>

        <View style={styles.field}>
          <View style={styles.flex}>
            <Text style={styles.content}>
              Nombre y apellido: {paciente.lastName} {paciente.firstName}
            </Text>
            <Text style={styles.content}>Edad: {paciente.age} años</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.content}>
              Doctor/a:{" "}
              {visita.secondaryDoctor
                ? visita.secondaryDoctor
                : paciente.doctor}
            </Text>
            <Text style={styles.content}>Protocolo: {visita.protocol}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.content}>Material: {visita.material}</Text>
            <Text style={styles.content}>
              Fecha: {new Date(visita.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.content}>Colpo: {visita.colpo}</Text>
            <Text style={styles.content}>OS: {paciente.obraSocial}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>
          Informe citológico (modificado de Sistema Bethesda Papanicolaou)
        </Text>

        <Text style={[styles.title, styles.bold]}>DIAGNOSTICO DESCRIPTIVO</Text>
        <Text style={styles.sectionHeader}>Descripcion macroscópica:</Text>

        <Text style={styles.content}>{visita[visita.type]?.macro}</Text>

        <Text style={styles.sectionHeader}>Descripcion microscópica:</Text>

        <Text style={styles.content}>{visita[visita.type]?.micro}</Text>

        <Text style={[styles.title, styles.bold]}>DIAGNOSTICO</Text>
        <Text style={styles.content}>{visita[visita.type]?.title}</Text>

        <Text style={styles.content}>
          Diagnostico: {visita[visita.type]?.description}
        </Text>

        <Text style={styles.content}>Notas: {visita[visita.type]?.notes}</Text>
      </View>
    </Page>
  );
};

export {
  PapDiagnosisComponent,
  CepilladoDiagnosisComponent,
  BiopsiaDiagnosisComponent,
};
