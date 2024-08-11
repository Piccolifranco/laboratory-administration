import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Image,
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
    paddingBottom: 100,
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
    bottom: 0,
    right: 0,
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
  <Page wrap style={styles.page}>
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
    <View style={styles.svgContainer} fixed>
      <Image
        src="/images/microscope_logo.jpg"
        style={{ width: 120, height: 100 }}
      />
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
  <Page wrap style={styles.page}>
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
    <View style={styles.svgContainer} fixed>
      <Image
        src="/images/microscope_logo.jpg"
        style={{ width: 120, height: 100 }}
      />
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
    <Page wrap style={styles.page}>
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
      <View style={styles.svgContainer} fixed>
        <Image
          src="/images/microscope_logo.jpg"
          style={{ width: 120, height: 100 }}
        />
      </View>
    </Page>
  );
};

export {
  PapDiagnosisComponent,
  CepilladoDiagnosisComponent,
  BiopsiaDiagnosisComponent,
};
