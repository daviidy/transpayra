import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq } from 'drizzle-orm'

// Fix all corrupted English titles
const corruptedToCorrect: Record<string, string> = {
  // Fix "Designer" corruption (Ofsigner)
  'Ui Ux Ofsigner': 'UI/UX Designer',
  'Ux Ofsigner': 'UX Designer',
  'Proofct Ofsigner': 'Product Designer',
  'Motion Ofsigner': 'Motion Designer',

  // Fix "Product" corruption (Proofct)
  'Proofct Manager': 'Product Manager',
  'Senior Proofct Manager': 'Senior Product Manager',
  'Proofct Owner': 'Product Owner',
  'Proofct Marketing Manager': 'Product Marketing Manager',
  'Proofct Ofsign Manager': 'Product Design Manager',

  // Fix "Developer" corruption (Ofveloper)
  'Web Ofveloper': 'Web Developer',
  'Ofveloper Advocate': 'Developer Advocate',
  'Quantitative Ofveloper': 'Quantitative Developer',
  'Sathesforce Ofveloper': 'Salesforce Developer',

  // Fix "Learning" corruption (Thearning)
  'Machine Thearning Engineer': 'Machine Learning Engineer',
  'Machine Thearning Ops Engineer': 'Machine Learning Ops Engineer',

  // Fix "Mobile" corruption (Mobithe)
  'Mobithe Software Engineer': 'Mobile Software Engineer',

  // Fix "Deployed" corruption (Ofployed)
  'Forward Ofployed Software Engineer': 'Forward Deployed Software Engineer',

  // Fix "Networking" corruption (Nandworking)
  'Nandworking Engineer': 'Networking Engineer',

  // Fix "Video" corruption (Viofo)
  'Viofo Game Software Engineer': 'Video Game Software Engineer',

  // Fix "Business" corruption (Bplantss)
  'Bplantss Intelligence Engineer': 'Business Intelligence Engineer',
  'Bplantss Intelligence Analyst': 'Business Intelligence Analyst',
  'Bplantss Analyst': 'Business Analyst',
}

// Proper French to English translations (ONLY for actual French titles)
const frenchToEnglish: Record<string, string> = {
  // Acheteur = Buyer/Purchaser
  'Acheteur Grande': 'Senior Buyer',
  'Acheteur Grande Distribution': 'Retail Buyer',
  'Acheteur': 'Buyer',
  'Acheteur Matières Premières': 'Raw Materials Buyer',
  'Acheteur Services/FM': 'Services Buyer',
  'Procurement Acheteur': 'Procurement Buyer',
  'Assistant Achats': 'Purchasing Assistant',

  // Gestionnaire = Manager/Administrator
  'Gestionnaire': 'Administrator',
  'Gestionnaire Achats': 'Purchasing Administrator',
  'Gestionnaire Flux & Stocks': 'Inventory Flow Administrator',
  'Gestionnaire Approvisionne- Ments': 'Supply Administrator',
  'Gestionnaire de Comptes Clients': 'Client Accounts Administrator',
  'Gestionnaire Export': 'Export Administrator',
  'Gestionnaire Import': 'Import Administrator',
  'Gestionnaire Import & Export': 'Import Export Administrator',
  'Gestionnaire Service Clients': 'Customer Service Administrator',
  'Gestionnaire de Sinistres Iard/Dab': 'Property Insurance Claims Administrator',
  'Biens Gestionnaire': 'Property Administrator',
  'Gestionnaire de Sinistres Corporels': 'Bodily Injury Claims Administrator',
  'Gestionnaire Portefeuille': 'Portfolio Administrator',
  'Gestionnaire Immobilier': 'Property Manager',
  'Gestionnaire Locatif': 'Rental Manager',
  'Personnes Gestionnaire': 'Personnel Administrator',
  'Gestionnaire Pièces Détachées': 'Spare Parts Administrator',
  'Gestionnaire Back-Office Marchés': 'Back Office Markets Administrator',
  'ChargÉ/ Administrator': 'Payroll Administrator',
  'Gestionnaire RH': 'HR Administrator',
  'Gestionnaire RH Hrbp Rrh Site Industriel': 'HR Business Partner',

  // Responsable = Manager/Head
  'Responsable Moyens Généraux': 'General Resources Manager',
  'Responsable Approvisionne- Ments': 'Supply Manager',
  'Responsable Logistique': 'Logistics Manager',
  'Responsable Flux & Stocks': 'Inventory Flow Manager',
  'Responsable Parc Automobile Engins': 'Fleet Manager',
  'Responsable Transports': 'Transport Manager',
  'Responsable d\'Entrepôt/ \'Entreposage': 'Warehouse Manager',
  'Responsable Opérations': 'Operations Manager',
  'Responsable Prévision Ventes': 'Sales Forecast Manager',
  'Responsable S&Op': 'S&OP Manager',
  'Responsable Commercial': 'Sales Manager',
  'Responsable Administration des Ventes': 'Sales Administration Manager',
  'Responsable Marketing': 'Marketing Manager',
  'Responsable Trade Marketing': 'Trade Marketing Manager',
  'Responsable Communication Design & Création': 'Communications Design Manager',
  'Responsable Digital Marketing': 'Digital Marketing Manager',
  'Responsable Communication Digital': 'Digital Communications Manager',
  'Responsable Digital': 'Digital Manager',
  'Responsable Financier': 'Financial Manager',
  'Responsable de Production': 'Production Manager',
  'Responsable Qualité': 'Quality Manager',
  'Responsable Hse': 'HSE Manager',
  'Responsable de Maintenance': 'Maintenance Manager',
  'Responsable Comptable': 'Accounting Manager',
  'Responsable Contrôle de Gestion': 'Management Control Manager',
  'Responsable Contrôle Gestion': 'Management Control Manager',
  'Responsable Contrôle Financier': 'Financial Control Manager',
  'Responsable Trésorerie': 'Treasury Manager',
  'Responsable de la Conformité': 'Compliance Manager',
  'Responsable Courtage': 'Brokerage Manager',
  'Responsable Commercial Courtage': 'Sales Brokerage Manager',
  'Responsable Grands Comptes': 'Key Accounts Manager',
  'Responsable Achats Logistics & Supply Chain': 'Purchasing Logistics Manager',
  'Responsable Export': 'Export Manager',
  'Responsable Import & Export': 'Import Export Manager',
  'Responsable Service Clients': 'Customer Service Manager',
  'Administration Responsable': 'Administration Manager',
  'Responsable Sinistres Iard/Dab': 'Property Insurance Claims Manager',
  'Supports Responsable': 'Support Manager',
  'Responsable Contrôle': 'Control Manager',
  'Responsable Risques': 'Risk Manager',
  'Responsable Commercial Banque': 'Bank Sales Manager',
  'Manager \'ÉQuipe/Plateau': 'Team Manager',
  '\'ÉQuipe/Plateau': 'Team',
  'Responsable Actuariat': 'Actuarial Manager',
  'Justice Responsable': 'Legal Manager',
  'Responsable Fiscal': 'Tax Manager',
  'Responsable Informatique': 'IT Manager',
  'Transverses Responsable': 'Cross-functional Manager',
  'Responsable \'ÉTudes': 'Research Manager',
  'Commissioning Responsable': 'Commissioning Manager',
  'Responsable Gmao': 'CMMS Manager',
  'Responsable Méthodes': 'Methods Manager',
  'Responsable Travaux Neufs': 'New Works Manager',
  'Travaux Neufs': 'New Works',
  'Responsable de Maintenance Adjoint': 'Deputy Maintenance Manager',
  'Responsable Bureau d\'ÉTudes': 'Design Office Manager',
  'Manager Bureau d\'ÉTudes': 'Design Office Manager',
  'Responsable Immobilier': 'Real Estate Manager',
  'Responsable Salle': 'Room Manager',
  'Responsable Sav': 'After-Sales Manager',
  'Responsable Pièces Détachées': 'Spare Parts Manager',
  'Manager Pièces Détachées': 'Spare Parts Manager',
  'Administrator Pièces Détachées': 'Spare Parts Administrator',
  'Responsable Administration du Personnel': 'Personnel Administration Manager',
  'Responsable Paie Développement RH': 'Payroll HR Development Manager',
  'Responsable de la Formation': 'Training Manager',
  'Responsable de Formation': 'Training Manager',
  'Responsable Développement RH': 'HR Development Manager',
  'Manager Développement': 'Development Manager',
  'Responsable Recrutement': 'Recruitment Manager',
  'Responsable RH': 'HR Manager',
  'Responsable Rse': 'CSR Manager',
  'Direction Responsable': 'Management Director',
  'Responsable des Infrastructures': 'Infrastructure Manager',
  'Responsable des Systèmes d\'Information': 'Information Systems Manager',
  'Responsable des Systèmes \'Information': 'Information Systems Manager',
  'Responsable Support/ Helpdesk': 'Support Helpdesk Manager',
  'Responsable Télévente': 'Telesales Manager',
  'Superviseur/ Manager Télévente': 'Telesales Manager',
  'Manager Télévente': 'Telesales Manager',
  'Responsable Recouvrement Contentieux': 'Debt Collection Manager',
  'Responsable Contrats': 'Contracts Manager',
  'Responsable Services Généraux': 'General Services Manager',
  'Manager Services Généraux': 'General Services Manager',
  'Manager Sinistres Iard/Dab': 'Property Insurance Claims Manager',
  'Responsable Administration Paie': 'Payroll Administration Manager',

  // Directeur = Director
  'Directeur d\'Agence': 'Branch Director',
  'Directeur des Opérations': 'Operations Director',
  'Director des Opérations': 'Operations Director',
  'Directeur Moyens Généraux': 'General Resources Director',
  'Director Moyens Généraux': 'General Resources Director',
  'Direction Directeur': 'Management Director',
  'Directeur Transports': 'Transport Director',
  'Directeur Logistique': 'Logistics Director',
  'Directeur Supply Chain Logistics & Supply Chain': 'Supply Chain Director',
  'Directeur Administratif and Financier': 'Administrative Financial Director',
  'Directeur du Contrôle Interne/ Permanent': 'Internal Control Director',
  'Directeur du Contrôle': 'Control Director',
  'Directeur d\'Investisse - Ment/Fonds': 'Investment Director',
  'Directeur de la Trésorerie': 'Treasury Director',
  'Directeur des Risques': 'Risk Director',
  'Risques': 'Risk',
  'Directeur Marketing': 'Marketing Director',
  'Directeur Commercial': 'Sales Director',
  'Directeur National des Ventes/ Sales Director': 'National Sales Director',
  'Directeur National des Ventes': 'National Sales Director',
  'Directeur de Clientèthe': 'Client Director',
  'Director of Clientèthe': 'Client Director',
  'Directeur Sav': 'After-Sales Director',
  'Commissioning Directeur Sav': 'After-Sales Commissioning Director',
  'Directeur Technique': 'Technical Director',
  'Director Technique': 'Technical Director',
  'Directeur Opérations': 'Operations Director',
  'Director Opérations': 'Operations Director',
  'Directeur Financier': 'Financial Director',
  'Directeur Comptable': 'Accounting Director',
  'Directeur du Contrôle de Gestion': 'Management Control Director',
  'Directeur Financier Groupe': 'Group Financial Director',
  'Directeur d\'Hôtel': 'Hotel Director',
  'Director d\'Hôtel': 'Hotel Director',
  'Directeur de Mission': 'Mission Director',
  'Directeur de Mission d\'Expérience': 'Experience Mission Director',
  'Director of Mission d\'Expérience': 'Experience Mission Director',
  'Ans d\'Expérience Director of Mission': 'Experience Mission Director',
  'Directeur de l\'Organisation': 'Organization Director',
  'Directeur Corporate Banking': 'Corporate Banking Director',
  'Détail/en Ligne Lead/Director': 'Retail Online Director',
  'Directeur RH': 'HR Director',
  'Directeur RH Adjoint': 'Deputy HR Director',
  'Directeur RH Groupe': 'Group HR Director',
  'Directeur des Infrastructures': 'Infrastructure Director',
  'Directeur des Systèmes d\'Information': 'Information Systems Director',
  'Directeur Général': 'General Director',
  'Directeur Général Adjoint': 'Deputy General Director',
  'Directeur Régional/ Sous-Régional': 'Regional Director',
  'Directeur Artistique': 'Art Director',
  'Directeur Magasin HypermarchÉ': 'Hypermarket Store Director',
  'Director Magasin HypermarchÉ': 'Hypermarket Store Director',
  'Directeur Magasin SupermarchÉ': 'Supermarket Store Director',
  'Director Magasin SupermarchÉ': 'Supermarket Store Director',
  'Distribution Directeur': 'Distribution Director',
  'Directeur d\'Expansion': 'Expansion Director',
  'Directeur Compliance': 'Compliance Director',
  'Directeur d\'Usine': 'Plant Director',
  'Directeur de Projects Bâtiment': 'Building Projects Director',
  'Director of Projects Bâtiment': 'Building Projects Director',
  'Directeur de Travaux Bâtiment': 'Building Works Director',
  'Director of Travaux Bâtiment': 'Building Works Director',
  'Directeur de Projects Travaux Publics': 'Public Works Projects Director',
  'Projects Travaux Publics': 'Public Works Projects',
  'Directeur Travaux Tp': 'Public Works Director',
  'Travaux Tp': 'Public Works',
  'Directeur National': 'National Director',
  'Directeur Régional': 'Regional Director',
  'Directeur Pays': 'Country Director',

  // Chef = Lead/Head
  'Chef de Projet': 'Project Lead',
  'Chef de Projects': 'Projects Lead',
  'Chef de Projet Ingénierie & Implémentation': 'Engineering Implementation Project Lead',
  'Lead of Project Ingénierie & Implémentation': 'Engineering Implementation Project Lead',
  'Chef de Projet Monétique': 'Payment Systems Project Lead',
  'Lead of Project Monétique': 'Payment Systems Project Lead',
  'Chef/Directeur \'Agence': 'Branch Director',
  'Chef de Zone de Ventes/Area Sales Manager': 'Territory Sales Manager',
  'Chef de Zone de Ventes': 'Territory Sales Lead',
  'Chef de Zone': 'Territory Lead',
  'Chef de Zone Export': 'Export Territory Lead',
  'Chef de Territoire de Ventes/ Territory Sales Manager': 'Territory Sales Manager',
  'Chef de Secteur Gms/Chr/Gsb/ /Gss': 'Sector Lead',
  'Lead of Sector Gms/Chr/Gsb/ /Gss': 'Sector Lead',
  'Chef de Secteur Gms/Chr/Gsb/ Gsa/Gss': 'Sector Lead',
  'Gms/Chr/Rhf/Gds Lead of Sector': 'Sector Lead',
  'Chef de Secteur HypermarchÉ': 'Hypermarket Sector Lead',
  'Lead of Sector HypermarchÉ': 'Hypermarket Sector Lead',
  'Chef de Secteur SupermarchÉ': 'Supermarket Sector Lead',
  'Lead of Sector SupermarchÉ': 'Supermarket Sector Lead',
  'Chef des Ventes': 'Sales Lead',
  'Chef des Ventes Régional /Chd': 'Regional Sales Lead',
  'Chef des Ventes/ Sales Manager': 'Sales Manager',
  'Médias Lead of Sales': 'Media Sales Lead',
  'Médias Chef des Ventes': 'Media Sales Lead',
  'Chef de Service': 'Service Lead',
  'Chef de Service Clientèthe /Pmi': 'Client Service Lead',
  'Lead of Service Clientèthe /Pmi': 'Client Service Lead',
  'Chef de Service Facturation': 'Billing Service Lead',
  'Chef de Mission': 'Mission Lead',
  'Chef de Mission Senior - Ans d\'Expérience': 'Senior Mission Lead',
  'Lead of Mission Senior - Ans d\'Expérience': 'Senior Mission Lead',
  'Chef d\'Équipe': 'Team Lead',
  'Chef d\'Équipe /Superviseur Call Center': 'Call Center Team Lead',
  'Lead d\'ÉQuipe /Superviseur Call Center': 'Call Center Team Lead',
  'Superviseur Lead d\'ÉQuipe': 'Team Lead Supervisor',
  'Chef d\'Équipe Maintenance': 'Maintenance Team Lead',
  'Lead d\'ÉQuipe Maintenance': 'Maintenance Team Lead',
  'Chef d\'Atelier': 'Workshop Lead',
  'Chef d\'Atelier Maintenance': 'Maintenance Workshop Lead',
  'Chef d\'Atelier Mécanique': 'Mechanical Workshop Lead',
  'Lead d\'Atelier Mécanique': 'Mechanical Workshop Lead',
  'Chef de Département': 'Department Lead',
  'Lead of Département': 'Department Lead',
  'Département/ Équipe': 'Department Team',
  'Chef Département Transit': 'Transit Department Lead',
  'Chef/ Responsable Comptable': 'Accounting Manager',
  'Chef/ Responsable': 'Manager',
  'Chef': 'Lead',
  'Assistant Chef': 'Assistant Lead',
  'Chef Réception': 'Reception Lead',
  'Lead Réception': 'Reception Lead',
  'Chef Barman': 'Head Barman',
  'Chef de Cuisine': 'Head Chef',
  'Chef de Centre': 'Center Lead',
  'Chef de Centre Emplisseur': 'Filling Center Lead',
  'Chef de Quart': 'Shift Lead',
  'Chef de Chantier': 'Site Lead',
  'Chef de Chantier Bâtiment': 'Building Site Lead',
  'Lead of Chantier Bâtiment': 'Building Site Lead',
  'Chef de Projects Bâtiment': 'Building Projects Lead',
  'Lead of Projects Bâtiment': 'Building Projects Lead',
  'Chef de Chantier Travaux Publics': 'Public Works Site Lead',
  'Travaux Publics': 'Public Works',
  'Chef de Projects Travaux Publics': 'Public Works Projects Lead',
  'Lead of Projects Travaux Publics': 'Public Works Projects Lead',

  // Ingénieur = Engineer
  'Ingénieur Devops': 'DevOps Engineer',
  'Ingénieur Cybersécurité': 'Cybersecurity Engineer',
  'Ingénieur Réseaux/ Systèmes Sécurité & Cybersécurité': 'Network Systems Security Engineer',
  'Ingénieur Systèmes/ Réseaux': 'Systems Network Engineer',
  'Ingénieur Qhse': 'QHSE Engineer',
  'Ingénieur Maintenance': 'Maintenance Engineer',
  '& Entretien Ingénieur': 'Maintenance Engineer',
  'Ingénieur Automatisme': 'Automation Engineer',
  'Ingénieur Méthodes': 'Methods Engineer',
  'Engineer Méthodes': 'Methods Engineer',
  'Ingénieur Commercial B-To-B': 'B2B Sales Engineer',
  'Ingénieur Commercial -To-B': 'B2B Sales Engineer',
  'Ingénieur \'Affaires': 'Business Engineer',
  'Ingénieur Commercial': 'Sales Engineer',
  'Ingénieur Travaux': 'Works Engineer',
  'Ingénieur Financier': 'Financial Engineer',
  'Ingénieur Principal Grands Projects': 'Principal Projects Engineer',
  'Ingénieur d\'ÉTudes and': 'Studies Engineer',
  'Engineer d\'ÉTudes and': 'Studies Engineer',
  'Ingénieur Bureau \'ÉTudes/R&d': 'R&D Design Engineer',
  'Engineer Bureau \'ÉTudes/R&d': 'R&D Design Engineer',
  'Essais Ingénieur Bureau': 'Testing Design Engineer',
  'Essais Ingénieur': 'Testing Engineer',
  'Ingénieur Laboratoire/ Essais': 'Laboratory Testing Engineer',

  // Technicien = Technician
  'Technicien de Maintenance/': 'Maintenance Technician',
  'Technicien Qualité R&d/Bureau d\'ÉTudes/ Essais': 'Quality R&D Technician',
  'Technicien Laboratoire/ Essais': 'Laboratory Technician',

  // Comptable = Accountant
  'Comptable Clients': 'Accounts Receivable Accountant',
  'Comptable Adjoint': 'Deputy Accountant',
  'Comptable Analytique': 'Analytical Accountant',
  'Comptable Fournisseurs': 'Accounts Payable Accountant',
  'Comptables Comptable': 'Accountant',
  'Comptables': 'Accountants',
  'Comptable Général': 'General Accountant',
  'Comptable Immobilisations': 'Fixed Assets Accountant',
  'Comptable Paie': 'Payroll Accountant',
  'Comptable Superviseur/ Senior/ConfirmÉ': 'Senior Accountant',
  'Accountant Superviseur/ Senior/ConfirmÉ': 'Senior Accountant',
  'Superviseur/ Senior/ConfirmÉ': 'Senior',
  'Comptable Trésorerie': 'Treasury Accountant',
  'Comptable Assistant': 'Assistant Accountant',
  'Comptables Aide-Comptable': 'Assistant Accountant',
  'Aide-Comptable': 'Assistant Accountant',
  'Assistant Comptable': 'Assistant Accountant',
  'Collaborateur Comptable': 'Accounting Associate',
  'Expert Comptable': 'Certified Accountant',
  'Manager Comptable': 'Accounting Manager',

  // Contrôleur = Controller
  'Contrôleur de Gestion': 'Management Controller',
  'Contrôleur Gestion': 'Management Controller',
  'Contrôleur Interne': 'Internal Controller',
  'Contrôleur Interne/ Permanent': 'Permanent Internal Controller',
  'Contrôleur Financier': 'Financial Controller',
  'Contrôleur de Gestion Corporate': 'Corporate Management Controller',
  'Contrôleur de Gestion Groupe': 'Group Management Controller',
  'Assistant Contrôleur de Gestion': 'Assistant Management Controller',

  // Assistant
  'Assistant Direction': 'Management Assistant',
  'Assistant de Direction': 'Management Assistant',
  'Assistant Polyvalent Pme': 'SME Versatile Assistant',
  'Bilingue Office Manager': 'Bilingual Office Manager',
  'Office Manager Anglais Courant/ Bilingue': 'Bilingual Office Manager',
  'Spécialisé Assistant': 'Specialized Assistant',
  'Assistant/ Secrétaire': 'Secretary Assistant',
  'Assistant/ Secrétaire Médicate': 'Medical Secretary',
  'Assistant Administratif': 'Administrative Assistant',
  'Assistant Président/ Direction': 'Executive Assistant',
  'Assistant de Président': 'Executive Assistant',
  'Assistant Manager': 'Assistant Manager',
  'Assistant Sales': 'Sales Assistant',
  'Assistant Commercial': 'Sales Assistant',
  'Assistant Commercial/ \'Agence': 'Branch Sales Assistant',
  'Assistant Logistique': 'Logistics Assistant',
  'Services Généraux': 'General Services',
  'Généraux': 'General',
  'Généraux Assistant': 'General Assistant',
  'Assistant Services Généraux': 'General Services Assistant',
  'Assistant Gestion': 'Management Assistant',
  'Assistant Financier': 'Financial Assistant',
  'Assistant Souscription': 'Underwriting Assistant',
  'Assistant RH': 'HR Assistant',

  // Analyste = Analyst
  'Analyste Financier': 'Financial Analyst',
  'Analyste Crédit': 'Credit Analyst',
  'Analyste Risques': 'Risk Analyst',
  'Supports Analyste Risques': 'Risk Analyst',
  'Analyste': 'Analyst',
  'D\'Affaires Analyste': 'Business Analyst',
  'Analyste Financier Junior': 'Junior Financial Analyst',
  'Analyste Financier Senior': 'Senior Financial Analyst',
  'Asset Management Analyste': 'Asset Management Analyst',

  // Agent
  'Agent Planification': 'Planning Agent',
  'Agent de Douane': 'Customs Agent',
  'Agent Tracking': 'Tracking Agent',
  'Agent de Transit': 'Transit Agent',
  'Agent de Transit/ Affrêteur': 'Transit Agent',
  'Agent Call Center': 'Call Center Agent',
  'Agent Facturation': 'Billing Agent',

  // Chauffeur = Driver
  'Chauffeur': 'Driver',
  'Chauffeur Challenger': 'Challenger Driver',
  'Chauffeur Engin': 'Heavy Equipment Driver',
  'Chauffeur Engin de Manutention': 'Handling Equipment Driver',
  'Chauffeur Tracteur Routier': 'Truck Driver',

  // Other roles
  'Magasinier': 'Warehouse Worker',
  'Magasinier/ Manutention- Naire': 'Warehouse Handler',
  'Magasinier/ Manutentionnaire': 'Warehouse Handler',
  'Déclarant': 'Declarant',
  'Déclarant Douanes': 'Customs Declarant',
  'Chargé de Communication': 'Communications Manager',
  'Chargé Administration du Personnel': 'Personnel Administration Manager',
  'Chargé Paie': 'Payroll Manager',
  'Chargé de Formation': 'Training Manager',
  'ChargÉ of Recruitment/ Recruteur': 'Recruiter',
  'Chargé RH': 'HR Manager',
  'Chargé Rse': 'CSR Manager',
  'Administrateur': 'Administrator',
  'Administrateur Systèmes/ Réseaux': 'Systems Network Administrator',
  'Systèmes/ Réseaux': 'Systems Networks',
  'Développement Lead of Project': 'Development Project Lead',
  'Développeur': 'Developer',
  'Développeur Mobithe': 'Mobile Developer',
  'Développeur Web': 'Web Developer',
  'Services Opérateur': 'Service Operator',
  'Opérateur Saisie': 'Data Entry Operator',
  'Conducteur': 'Operator',
  'Conducteur Ligne': 'Line Operator',
  'Conducteur of Travaux Bâtiment': 'Building Works Supervisor',
  'Travaux Bâtiment': 'Building Works',
  'Conducteur Travaux Tp': 'Public Works Supervisor',
  'Topographe': 'Surveyor',
  'Graphiste': 'Graphic Designer',
  'Infographiste': 'Graphic Designer',
  'Dessinateur': 'Draftsman',
  'Dessinateur Projeteur': 'Design Draftsman',
  'Portefeuille': 'Portfolio',
  'Trader': 'Trader',
  'Trésorier': 'Treasurer',
  'Actuaire': 'Actuary',
  'Transverses Actuaire': 'Actuary',
  'Souscripteur': 'Underwriter',
  'Auditeur Junior < Ans d\'Expérience': 'Junior Auditor',
  'Auditeur Junior (A1) An d\'Expérience': 'Junior Auditor',
  'Fiscaliste': 'Tax Specialist',
  'Fiscaliste \'Entreprise': 'Corporate Tax Specialist',
  'Juriste': 'Lawyer',
  'Juriste Bancaire': 'Banking Lawyer',
  'Juriste Fiscaliste': 'Tax Lawyer',
  'ÉLectricien': 'Electrician',
  'ÉLectricien Automobile': 'Automotive Electrician',
  'Maintenance/ ÉLectricien': 'Maintenance Electrician',
  'Mécanicien': 'Mechanic',
  'Mécanicien Automobile': 'Automotive Mechanic',
  'Automobiles Director Sav': 'Automotive After-Sales Director',
  'Mécanicien Poids Lourds': 'Heavy Vehicle Mechanic',
  'Maintenance/ Mécanicien': 'Maintenance Mechanic',
  'Coordinateur RH': 'HR Coordinator',
  'Product Owner': 'Product Owner',
  'Ingénieur Tests': 'Test Engineer',
  'Ingénieur Tests/ Recettes': 'Test Engineer',
  'Barman': 'Barman',
  'Gérant': 'Manager',
  'Gouvernant': 'Housekeeper',
  'Réceptionniste': 'Receptionist',
  'Réceptionniste Bilingue Anglais- Français': 'Bilingual Receptionist',
  'Hardware/Web Responsable': 'Hardware Web Manager',
  'Superviseur': 'Supervisor',
  'Superviseur Call Center': 'Call Center Supervisor',
  'Médias Superviseur': 'Media Supervisor',
  'Boucher, Boulanger, Caissier…': 'Butcher Baker Cashier',
  'Vendeur & ÉQuipier Polyvalent': 'Sales Associate',
  '& ÉQuipier Polyvalent': 'Versatile Team Member',
  'Manager of Pôthe': 'Hub Manager',
  'Responsable de Pôle': 'Hub Manager',
  'Responsable d\'Expansion': 'Expansion Manager',
  'Responsable Enseigne de Marques': 'Brand Manager',
  'Responsable Adjoint Enseigne Marques': 'Deputy Brand Manager',
  'Responsable Laboratoire/ Essais': 'Laboratory Manager',
}

async function restoreAndTranslateProperly() {
  console.log('Restoring corrupted titles and translating French titles properly...\n')

  try {
    const allTitles = await db.select().from(jobTitle)
    console.log(`Total titles: ${allTitles.length}\n`)

    // Step 1: Fix corrupted English titles
    console.log('Step 1: Fixing corrupted English titles...\n')
    let restoredCount = 0
    for (const [corrupted, correct] of Object.entries(corruptedToCorrect)) {
      const found = allTitles.find(t => t.title === corrupted)
      if (found) {
        try {
          await db.update(jobTitle).set({ title: correct }).where(eq(jobTitle.jobTitleId, found.jobTitleId))
          console.log(`✓ Restored: "${corrupted}" → "${correct}"`)
          restoredCount++
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error'
          console.error(`✗ Failed: "${corrupted}" - ${message}`)
        }
      }
    }
    console.log(`\n✓ Restored ${restoredCount} corrupted titles\n`)

    // Step 2: Translate French titles
    console.log('Step 2: Translating French titles to English...\n')
    let translatedCount = 0
    const toDelete: number[] = []

    for (const [french, english] of Object.entries(frenchToEnglish)) {
      const found = allTitles.find(t => t.title === french)
      if (found) {
        // Check if English version already exists
        const existingEnglish = allTitles.find(t => t.title === english && t.jobTitleId !== found.jobTitleId)

        if (existingEnglish) {
          // Delete the French duplicate
          toDelete.push(found.jobTitleId)
          console.log(`✓ Will delete: "${french}" (duplicate of "${english}")`)
        } else {
          try {
            await db.update(jobTitle).set({ title: english }).where(eq(jobTitle.jobTitleId, found.jobTitleId))
            console.log(`✓ Translated: "${french}" → "${english}"`)
            translatedCount++
          } catch (error: unknown) {
            const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error'
            console.error(`✗ Failed: "${french}" - ${message}`)
          }
        }
      }
    }

    // Delete French duplicates
    if (toDelete.length > 0) {
      console.log(`\nDeleting ${toDelete.length} French duplicates...`)
      for (const id of toDelete) {
        await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, id))
      }
      console.log(`✓ Deleted ${toDelete.length} duplicates`)
    }

    console.log(`\n✅ Complete!`)
    console.log(`Restored: ${restoredCount} corrupted titles`)
    console.log(`Translated: ${translatedCount} French titles`)
    console.log(`Deleted: ${toDelete.length} duplicates`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

restoreAndTranslateProperly()
