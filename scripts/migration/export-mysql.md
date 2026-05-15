# Migration MySQL vers Supabase (PostgreSQL)

## Prérequis

- Accès à la base de données MySQL source
- Projet Supabase configuré
- `psql` ou accès à l'interface Supabase SQL Editor

## Étapes de migration

### 1. Exporter les données MySQL

```bash
# Export complet en CSV par table
mysqldump --no-create-info --complete-insert \
  --fields-terminated-by=',' \
  --fields-enclosed-by='"' \
  --lines-terminated-by='\n' \
  -u root -p nom_base_de_données \
  clients > clients.csv
```

### 2. Préparer le schéma Supabase

Exécuter le fichier `sql/schema.sql` dans l'éditeur SQL de Supabase.

### 3. Mapper les colonnes

| MySQL (ancien) | Supabase (nouveau) | Notes |
|---|---|---|
| `id` | `id` (UUID) | Généré automatiquement |
| `nom` | `last_name` | |
| `prenom` | `first_name` | |
| `societe` | `company_name` | |
| `telephone` | `phone` | |
| `created_at` | `created_at` | Format TIMESTAMPTZ |

### 4. Importer via psql

```bash
# Importer les clients
psql $DATABASE_URL -c "\COPY clients (first_name, last_name, email, phone) FROM 'clients.csv' CSV HEADER"
```

### 5. Vérification

```sql
-- Vérifier le nombre de lignes importées
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM cases;

-- Vérifier l'intégrité référentielle
SELECT c.reference, cl.email
FROM cases c
JOIN clients cl ON c.client_id = cl.id
LIMIT 10;
```

## Notes importantes

- Les UUIDs sont générés automatiquement par Supabase
- Les champs `created_by` doivent référencer un profil existant
- Les RLS policies sont actives dès la création des tables
- Désactiver temporairement les RLS pour l'import si nécessaire :
  ```sql
  ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
  -- Import...
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  ```
