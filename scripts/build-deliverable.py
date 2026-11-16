from pathlib import Path
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs"
ASSETS = OUT / "assets"
OUT.mkdir(exist_ok=True)
ASSETS.mkdir(exist_ok=True)

BLUE = "1F4E78"
LIGHT = "DCE6F1"
INK = "1F2937"
GRAY = "667085"
WHITE = "FFFFFF"

doc = Document()
section = doc.sections[0]
section.top_margin = section.bottom_margin = Inches(1)
section.left_margin = section.right_margin = Inches(1)
section.header_distance = section.footer_distance = Inches(0.492)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(11)
normal.font.color.rgb = RGBColor.from_string(INK)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.1
for name, size, color, before, after in [
    ("Title", 28, BLUE, 0, 8),
    ("Heading 1", 16, BLUE, 16, 8),
    ("Heading 2", 13, BLUE, 12, 6),
    ("Heading 3", 12, "365F91", 8, 4),
]:
    style = styles[name]
    style.font.name = "Calibri"
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor.from_string(color)
    style.font.bold = name != "Title"
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)

header = section.header.paragraphs[0]
header.text = "SportBook  |  Entregable 1"
header.style = normal
header.runs[0].font.size = Pt(9)
header.runs[0].font.color.rgb = RGBColor.from_string(GRAY)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = footer.add_run("Tecnologías de Desarrollo en el Servidor  •  Otoño 2026")
run.font.size = Pt(9)
run.font.color.rgb = RGBColor.from_string(GRAY)

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)

def set_cell_margin(cell, top=90, start=120, bottom=90, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")

def table(headers, rows, widths, font_size=11):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.style = "Table Grid"
    for i, text in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.width = Inches(widths[i])
        cell.text = text
        shade(cell, LIGHT)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in cell.paragraphs[0].runs:
            r.bold = True
            r.font.color.rgb = RGBColor.from_string(BLUE)
    for row in rows:
        cells = t.add_row().cells
        for i, text in enumerate(row):
            cells[i].width = Inches(widths[i])
            cells[i].text = str(text)
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margin(cells[i])
    for cell in t.rows[0].cells:
        set_cell_margin(cell)
    for row in t.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.space_after = Pt(0)
                for run in paragraph.runs:
                    run.font.size = Pt(font_size)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

def flow_table(steps):
    headers = [step[0] for step in steps]
    details = [step[1] for step in steps]
    return table(headers, [details], [6.5 / len(steps)] * len(steps))

def bullet(text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(4)
    p.add_run(text)

def feature(name, why, what):
    doc.add_heading(name, level=2)
    p = doc.add_paragraph()
    p.add_run("WHY. ").bold = True
    p.add_run(why)
    p = doc.add_paragraph()
    p.add_run("WHAT. ").bold = True
    p.add_run(what)
    p = doc.add_paragraph()
    p.add_run("Estado: ").bold = True
    p.add_run("Funcional y verificado").font.color.rgb = RGBColor(0x1B, 0x5E, 0x20)

def page_break():
    doc.add_page_break()

# Cover: editorial_cover pattern
doc.add_paragraph().paragraph_format.space_after = Pt(80)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("PROYECTO INTEGRADOR")
r.bold = True; r.font.size = Pt(11); r.font.color.rgb = RGBColor.from_string(BLUE)
p = doc.add_paragraph("SportBook", style="Title")
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p = doc.add_paragraph("Aplicación web de reservaciones deportivas")
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.runs[0].font.size = Pt(16); p.runs[0].font.color.rgb = RGBColor.from_string(GRAY)
doc.add_paragraph().paragraph_format.space_after = Pt(70)
for label, value in [
    ("Entrega", "Entregable 1: definición, arquitectura y base funcional"),
    ("Integrantes", "[INTEGRANTE 1]  •  [INTEGRANTE 2]"),
    ("Grupo", "[GRUPO]"),
    ("Curso", "Tecnologías de Desarrollo en el Servidor"),
    ("Fecha", "15 de octubre de 2026"),
]:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    a = p.add_run(label + ": "); a.bold = True; a.font.color.rgb = RGBColor.from_string(BLUE)
    p.add_run(value)

page_break()
doc.add_heading("1. Descripción general", level=1)
doc.add_heading("1.1 Problema", level=2)
doc.add_paragraph(
    "Los pequeños negocios deportivos suelen administrar canchas y reservaciones mediante mensajes, llamadas o registros dispersos. "
    "Esto dificulta conocer la disponibilidad real y aumenta el riesgo de duplicar reservaciones. SportBook centraliza instalaciones, "
    "canchas, horarios y, en la siguiente etapa, reservaciones de clientes."
)
doc.add_heading("1.2 Usuarios principales", level=2)
bullet("Cliente: consultará instalaciones, canchas y horarios; realizará y cancelará sus propias reservaciones.")
bullet("Administrador: gestionará instalaciones, canchas, horarios, imágenes y reservaciones.")
doc.add_heading("1.3 Propósito y justificación", level=2)
doc.add_paragraph(
    "El propósito es ofrecer un MVP backend claro, mantenible y demostrable que reduzca errores de agenda. El dominio permite integrar "
    "los contenidos obligatorios del curso sin agregar funciones ajenas: API REST, persistencia, OAuth con Google, sockets, archivos en "
    "la nube, una API externa, pruebas, CI/CD y despliegue."
)
doc.add_heading("1.4 Alcance de esta entrega", level=2)
doc.add_paragraph(
    "La primera versión implementa tres CRUD completos: instalaciones, canchas y horarios concretos de una hora. Los flujos recorren "
    "Route, Controller, Service, Repository y MongoDB. Autenticación, reservaciones y servicios externos quedan planeados para avances posteriores."
)

page_break()
doc.add_heading("2. Relación con los requisitos del curso", level=1)
table(
    ["Requisito", "Cómo lo cubrirá SportBook", "Estado / feature"],
    [
        ("Node.js, Express y TypeScript", "API REST y arquitectura por capas.", "Implementado / todas"),
        ("MongoDB y Mongoose", "Persistencia de instalaciones, canchas y horarios.", "Implementado / 3 features"),
        ("Autenticación y roles", "Google OAuth; roles CLIENT y ADMIN.", "Planeado"),
        ("API REST externa", "Pronóstico por coordenadas con Open-Meteo.", "Planeado"),
        ("Tiempo real", "Socket.IO notificará cambios de disponibilidad.", "Planeado"),
        ("Archivos en la nube", "Fotografías de canchas en Cloudinary.", "Planeado"),
        ("Pruebas y CI/CD", "Jest/Supertest y GitHub Actions.", "Verificación inicial creada"),
        ("Despliegue", "Contenedor y hosting público.", "Docker preparado; hosting planeado"),
    ],
    [1.6, 3.2, 1.7],
)

page_break()
doc.add_heading("3. Arquitectura general", level=1)
doc.add_paragraph(
    "SportBook utiliza MVC extendido con Service y Repository. Las rutas definen endpoints; los controladores traducen HTTP; los servicios "
    "aplican reglas; los repositorios encapsulan Mongoose; los modelos definen persistencia. Esta separación evita mezclar transporte, negocio y datos."
)
flow_table([
    ("Cliente →", "Postman o navegador\nJSON sobre HTTP"),
    ("API Express →", "Routes y Controllers\nEntrada y salida HTTP"),
    ("Aplicación →", "Services\nReglas de negocio"),
    ("Datos", "Repositories y Models\nMongoDB / Mongoose"),
])
p = doc.add_paragraph("Figura 1. Arquitectura implementada en la primera entrega.")
p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.runs[0].italic = True
doc.add_heading("3.1 Responsabilidades", level=2)
table(
    ["Capa", "Responsabilidad"],
    [
        ("Route", "Asocia método y endpoint con un controlador."),
        ("Controller", "Lee request, invoca el servicio y produce response."),
        ("Service", "Valida datos y aplica reglas del dominio."),
        ("Repository", "Realiza consultas sin exponer Mongoose a otras capas."),
        ("Model / MongoDB", "Define esquema, índices, relaciones y persistencia."),
    ],
    [1.5, 5.0],
)
doc.add_heading("3.2 Estructura base", level=2)
doc.add_paragraph(
    "src/app.ts y src/server.ts separan la aplicación del arranque. Los módulos controllers, services, repositories, models y routes "
    "contienen las tres features. middleware centraliza errores; errors y utils contienen componentes compartidos mínimos."
)

page_break()
doc.add_heading("4. Features funcionales", level=1)
feature(
    "4.1 Instalaciones",
    "Representar los negocios o sedes donde se encuentran las canchas y conservar sus coordenadas para integrar el clima.",
    "Crea, lista, consulta, actualiza y elimina instalaciones. Evita duplicados por nombre y dirección, y bloquea eliminar una sede con canchas.",
)
feature(
    "4.2 Canchas",
    "Identificar los espacios deportivos reservables y asociarlos con una instalación existente.",
    "Crea, lista, filtra, consulta, actualiza y elimina canchas de fútbol, pádel o tenis. Impide eliminar una cancha con horarios.",
)
feature(
    "4.3 Horarios",
    "Publicar disponibilidades concretas que posteriormente podrán reservar los clientes.",
    "Administra horarios de una hora con estados AVAILABLE o BLOCKED. Evita dos horarios con el mismo inicio en una cancha.",
)
doc.add_heading("4.4 Reglas verificables", level=2)
bullet("Una cancha solo puede referenciar una instalación existente.")
bullet("Un horario solo puede referenciar una cancha existente.")
bullet("Cada horario debe durar exactamente 60 minutos.")
bullet("Los conflictos de unicidad responden 409 Conflict.")
bullet("Los datos inválidos responden 400 y los recursos inexistentes 404.")

page_break()
doc.add_heading("5. Recorridos de requests", level=1)
for i, endpoint in enumerate(["POST /api/installations", "POST /api/courts", "POST /api/time-slots"], start=1):
    repositories = ["InstallationRepository", "CourtRepository", "TimeSlotRepository"]
    flow_table([
        ("Cliente →", endpoint + "\nBody JSON"),
        ("Backend →", "Route → Controller\nService valida"),
        ("Persistencia →", repositories[i - 1] + "\nMongoDB"),
        ("Respuesta", "201 Created\nDocumento JSON"),
    ])
    captions = [
        "POST /api/installations: el servicio valida datos y el repositorio crea el documento.",
        "POST /api/courts: el servicio comprueba la instalación antes de persistir.",
        "POST /api/time-slots: el servicio comprueba cancha y duración antes de persistir.",
    ]
    p = doc.add_paragraph(f"Figura {i + 1}. {captions[i - 1]}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.runs[0].italic = True

page_break()
doc.add_heading("6. API documentada", level=1)
api_rows = [
    ("POST", "/api/installations", "Crear sede", "nombre, dirección, coordenadas", "201; 400; 409"),
    ("GET", "/api/installations", "Listar sedes", "—", "200"),
    ("GET", "/api/installations/:id", "Consultar sede", "id", "200; 400; 404"),
    ("PATCH", "/api/installations/:id", "Actualizar sede", "campos parciales", "200; 400; 404"),
    ("DELETE", "/api/installations/:id", "Eliminar sede", "id", "204; 404; 409"),
    ("POST", "/api/courts", "Crear cancha", "installationId, name, sport", "201; 400; 404; 409"),
    ("GET", "/api/courts", "Listar / filtrar", "?installationId", "200; 400"),
    ("GET", "/api/courts/:id", "Consultar cancha", "id", "200; 400; 404"),
    ("PATCH", "/api/courts/:id", "Actualizar cancha", "campos parciales", "200; 400; 404; 409"),
    ("DELETE", "/api/courts/:id", "Eliminar cancha", "id", "204; 404; 409"),
    ("POST", "/api/time-slots", "Crear horario", "courtId, startTime, endTime", "201; 400; 404; 409"),
    ("GET", "/api/time-slots", "Listar / filtrar", "?courtId&status", "200; 400"),
    ("GET", "/api/time-slots/:id", "Consultar horario", "id", "200; 400; 404"),
    ("PATCH", "/api/time-slots/:id", "Actualizar horario", "campos parciales", "200; 400; 404; 409"),
    ("DELETE", "/api/time-slots/:id", "Eliminar horario", "id", "204; 400; 404"),
]
table(["Método", "Endpoint", "Propósito", "Request", "HTTP"], api_rows, [0.65, 1.75, 1.25, 1.75, 1.1], font_size=8)
doc.add_heading("6.1 Formato de respuesta", level=2)
doc.add_paragraph(
    "Las respuestas exitosas devuelven documentos JSON. Los errores utilizan { error, details? }. Las altas responden 201, consultas y "
    "actualizaciones 200, y eliminaciones 204."
)

page_break()
doc.add_heading("7. Evidencia de funcionamiento", level=1)
doc.add_paragraph(
    "La evidencia se obtuvo con npm run verify:first-delivery. El script compiló TypeScript, levantó una instancia temporal real de MongoDB, "
    "ejecutó los requests contra Express y cerró el entorno al terminar."
)
table(
    ["Feature", "Request", "Resultado", "Evidencia"],
    [
        ("Instalaciones", "POST /api/installations", "201 Created", "Documento con _id y timestamps"),
        ("Canchas", "POST /api/courts", "201 Created", "Cancha ligada a installationId"),
        ("Horarios", "POST /api/time-slots", "201 Created", "Duración de una hora y AVAILABLE"),
        ("Persistencia", "GET /api/time-slots?courtId=…", "200 OK", "Horario recuperado con cancha relacionada"),
    ],
    [1.15, 2.25, 1.05, 2.05],
)
doc.add_heading("7.1 Respuestas observadas", level=2)
for title, value in [
    ("Instalación", 'HTTP 201 — { "name": "Unidad Deportiva ITESO", "active": true, "_id": "…" }'),
    ("Cancha", 'HTTP 201 — { "installationId": "…", "name": "Cancha Norte", "sport": "futbol" }'),
    ("Horario", 'HTTP 201 — { "startTime": "2026-10-20T18:00:00.000Z", "endTime": "2026-10-20T19:00:00.000Z", "status": "AVAILABLE" }'),
    ("Consulta", 'HTTP 200 — [ { "courtId": { "name": "Cancha Norte" }, "status": "AVAILABLE" } ]'),
]:
    p = doc.add_paragraph()
    p.add_run(title + ": ").bold = True
    r = p.add_run(value); r.font.name = "Consolas"; r.font.size = Pt(9)
doc.add_paragraph("Resultado automatizado: 3 features verificadas correctamente con MongoDB temporal.")

doc.add_heading("8. Repositorio", level=1)
doc.add_paragraph("Repositorio público: https://github.com/Roi-flores13/SportReservationApp")
bullet("README con instalación, ejecución, features, reglas y endpoints.")
bullet(".env.example sin secretos.")
bullet("Dockerfile y compose.yaml para backend y MongoDB.")
bullet("Script reproducible de verificación: npm run verify:first-delivery.")

page_break()
doc.add_heading("9. Estado actual y próximos pasos", level=1)
doc.add_paragraph(
    "La base funcional cumple el objetivo del primer avance: tres features persistentes, arquitectura coherente, API documentada y evidencia "
    "reproducible. El siguiente incremento incorporará Reservation y User, cancelación con historial, prevención atómica de doble reservación "
    "y control de acceso. Después se integrarán Google OAuth, Socket.IO, Cloudinary, Open-Meteo, pruebas completas, CI/CD y hosting."
)

doc.add_heading("10. Uso de inteligencia artificial", level=1)
doc.add_paragraph(
    "Se utilizó ChatGPT/Codex como apoyo para analizar la guía y la rúbrica, proponer el diseño por capas, implementar la base de las tres "
    "features, preparar la verificación y estructurar este reporte. El equipo es responsable de revisar, probar, adaptar y comprender el código. "
    "Antes de entregar, ambos integrantes deben poder explicar cada recorrido y modificarlo durante una revisión."
)

doc.save(OUT / "Entregable_1_SportBook.docx")
print(OUT / "Entregable_1_SportBook.docx")
