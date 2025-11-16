-- Seed script to migrate existing hardcoded agents to database
-- This inserts the 6 original Marconi agents into the agents table

INSERT INTO agents (name, email, phone, whatsapp, photo_public_id, bio, specialty, years_of_experience, active) VALUES
(
  'Gustavo Marconi',
  'marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3482 704694',
  '+54 9 3482 704694',
  'gustavo_vdczse',
  'CEO y fundador de Marconi Inmobiliaria, con más de 15 años de experiencia en el mercado inmobiliario de Reconquista. Especialista en propiedades residenciales y comerciales, liderando el equipo con visión estratégica y compromiso total con la satisfacción del cliente.',
  'Propiedades Residenciales y Comerciales',
  15,
  true
),
(
  'Ramón Suligoy',
  'ramon.suligoy@marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3482 219676',
  '+54 9 3482 219676',
  'ramon_iyryyc',
  'Gestor comercial especializado en propiedades comerciales e inversiones. Con amplia experiencia en el mercado local, ayuda a empresarios y emprendedores a encontrar la ubicación perfecta para sus negocios en Reconquista y zona.',
  'Propiedades Comerciales',
  10,
  true
),
(
  'Priscila Maydana',
  'priscila.maydana@marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3482 653547',
  '+54 9 3482 653547',
  'priscila_gbc46h',
  'Gestora comercial especializada en propiedades residenciales. Su enfoque personalizado y atención al detalle la convierten en la elección ideal para familias que buscan su hogar perfecto en Reconquista.',
  'Propiedades Residenciales',
  8,
  true
),
(
  'Facundo Altamirano',
  'facundo.altamirano@marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3482 755308',
  '+54 9 3482 755308',
  'facundo_axinkj',
  'Community Manager especializado en marketing digital inmobiliario. Se encarga de la presencia online de la empresa y de conectar propiedades con potenciales compradores a través de estrategias digitales innovadoras.',
  'Marketing Digital Inmobiliario',
  5,
  true
),
(
  'Micaela Domínguez',
  'micaela.dominguez@marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3487 229722',
  '+54 9 3487 229722',
  'micaela_rl56r5',
  'Community Manager especializada en comunicaciones digitales y marketing inmobiliario. Trabaja en conjunto con el equipo para crear contenido atractivo y mantener una comunicación fluida con clientes actuales y potenciales.',
  'Marketing Digital y Comunicaciones',
  4,
  true
),
(
  'Bruno Bordón',
  'bruno.bordon@marconinegociosinmobiliarios@hotmail.com',
  '+54 9 3482 261937',
  '+54 9 3482 261937',
  'bruno_aqcgnn',
  'Corredor inmobiliario matriculado con amplia experiencia en transacciones inmobiliarias. Se especializa en asesorar legalmente las operaciones y garantizar que todos los procesos se realicen de manera correcta y segura.',
  'Transacciones Inmobiliarias',
  12,
  true
)
ON CONFLICT (email) DO NOTHING;

-- Show inserted agents
SELECT id, name, specialty, years_of_experience, active FROM agents ORDER BY id;
