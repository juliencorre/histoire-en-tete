from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
source = json.loads((ROOT / 'sources' / 'fiches-contenu.json').read_text(encoding='utf-8'))
lessons = source['cards']
QUESTIONS = []


def typed(topic, name, prompt, answer, explanation, accepted=None, category='repères'):
    QUESTIONS.append(dict(id=f'{topic}-{name}', topic=topic, type='text', prompt=prompt,
                          answer=answer, accepted=accepted or [answer], explanation=explanation,
                          category=category))


def choice(topic, name, prompt, answer, wrong, explanation, category='comprendre'):
    QUESTIONS.append(dict(id=f'{topic}-{name}', topic=topic, type='choice', prompt=prompt,
                          answer=answer, options=[answer]+wrong, explanation=explanation,
                          category=category))


typed('H1','330','En quelle année Constantin fonde-t-il Constantinople ?','330','Constantin fonde une nouvelle capitale en 330.')
typed('H1','constantin','Quel empereur fonde Constantinople ?','Constantin','Constantin fonde Constantinople sur le site de Byzance.',category='personnages')
typed('H1','395','En quelle année l’Empire romain est-il partagé en deux ?','395','En 395, l’Empire est partagé entre l’Occident et l’Orient.')
choice('H1','bosphore','Où se situe Constantinople ?','Au bord du Bosphore, entre l’Europe et l’Asie',['Au bord de la mer Rouge','Au centre de la Gaule','Sur la côte de l’océan Atlantique'],'Sa position permet de défendre l’Empire et de contrôler les routes du commerce.')
choice('H1','position','Pourquoi la position de Constantinople est-elle utile ?','Pour défendre l’Empire et contrôler les routes commerciales',['Pour éviter tout commerce','Pour être loin de toutes les routes','Pour supprimer le pouvoir de l’empereur'],'Le Bosphore donne à Constantinople une position stratégique.')

typed('H2','476','En quelle année l’Empire romain d’Occident disparaît-il ?','476','En 476, Odoacre renverse l’empereur d’Occident. L’Orient continue.')
choice('H2','orient','Après 476, que devient l’Empire romain d’Orient ?','Il continue sous le nom d’Empire byzantin',['Il disparaît en même temps que l’Occident','Il devient l’Empire carolingien','Il est dirigé par Charlemagne'],'La disparition de l’Occident n’est pas celle de tout l’Empire romain.')
choice('H2','ouest','Que signifie « Occident » ?','L’ouest',['L’est','Le nord','Le sud'],'Occident signifie ouest ; Orient signifie est.',category='mots')
typed('H2','odoacre','Quel chef renverse l’empereur d’Occident en 476 ?','Odoacre','Odoacre renverse l’empereur romain d’Occident.',category='personnages')
typed('H2','406','Quelle date le cours donne-t-il pour les invasions en Gaule ?','406','Le cours place les invasions en Gaule en 406.')

typed('H3','justinien','Quel empereur veut restaurer la puissance de Rome au VIe siècle ?','Justinien','Justinien règne sur l’Empire byzantin de 527 à 565.',category='personnages')
choice('H3','regne','Quand Justinien règne-t-il ?','De 527 à 565',['De 797 à 802','De 1095 à 1099','De 330 à 395'],'Le règne de Justinien dure de 527 à 565.',category='repères')
typed('H3','code','Quelle date le cours donne-t-il pour le Code de Justinien ?','529','Le cours date le Code de Justinien de 529. Il rassemble des lois.')
choice('H3','actions','Quels moyens Justinien utilise-t-il pour renforcer son empire ?','Reconquêtes, lois et construction d’églises',['Abandon des territoires et des lois','Croisades et fondation des Templiers','Fondation de Bagdad et de Médine'],'Justinien fait mener des reconquêtes, rédiger le Code et bâtir des églises.')
typed('H3','sainte-sophie','Quelle grande église Justinien fait-il bâtir à Constantinople ?','Sainte-Sophie','Sainte-Sophie est construite entre 532 et 537.',accepted=['Sainte-Sophie','Sainte Sophie','la basilique Sainte-Sophie','église Sainte-Sophie'])
typed('H3','belisaire','Quel général de Justinien mène les reconquêtes ?','Bélisaire','Bélisaire mène notamment les reconquêtes en Italie et en Afrique du Nord.',category='personnages')

typed('H4','622','En quelle année a lieu l’Hégire ?','622','En 622, Mohammed quitte La Mecque pour Médine : c’est l’Hégire.')
choice('H4','hegire','Quel trajet correspond à l’Hégire ?','De La Mecque à Médine',['De Médine à Rome','De Bagdad à Constantinople','De Jérusalem à Aix-la-Chapelle'],'L’Hégire est le départ de Mohammed de La Mecque vers Médine.')
typed('H4','coran','Quel est le livre sacré de l’islam ?','Le Coran','Le Coran est le livre sacré des musulmans.',category='mots')
typed('H4','mosquee','Quel est le lieu de prière des musulmans ?','La mosquée','Les musulmans prient à la mosquée.',accepted=['mosquée','la mosquée','une mosquée'],category='mots')
choice('H4','monotheisme','Que signifie « religion monothéiste » ?','Une religion fondée sur la croyance en un seul Dieu',['Une religion sans livre sacré','Une religion avec plusieurs dieux','Une religion réservée aux empereurs'],'Les musulmans croient en un seul Dieu. Le christianisme est aussi monothéiste.',category='mots')
choice('H4','piliers','Laquelle de ces pratiques fait partie des cinq piliers de l’islam ?','L’aumône, pour aider les pauvres',['Le couronnement d’un empereur','La conquête de Constantinople','Le partage d’un empire'],'Les cinq piliers sont la profession de foi, la prière, l’aumône, le jeûne du ramadan et le pèlerinage à La Mecque si on le peut.')
typed('H4','632','En quelle année Mohammed meurt-il ?','632','Mohammed meurt en 632. Après lui, les califes dirigent l’Empire musulman.')

typed('H5','762','En quelle année Bagdad est-elle fondée ?','762','Al-Mansur fonde Bagdad en 762. Elle devient la capitale des Abbassides.')
typed('H5','al-mansur','Quel calife fonde Bagdad ?','Al-Mansur','Al-Mansur fonde Bagdad en 762.',accepted=['Al-Mansur','Al Mansur','Al-Mansour','Mansur','Mansour'],category='personnages')
choice('H5','calife','Quels sont les deux rôles du calife ?','Politique et religieux',['Uniquement commercial','Uniquement militaire','Artistique et sportif'],'Le calife est un chef politique et religieux.',category='mots')
choice('H5','1258','Quel événement a lieu à Bagdad en 1258 ?','Les Mongols prennent la ville',['Al-Mansur fonde la ville','L’islam disparaît','Charlemagne y est couronné'],'En 1258, les Mongols prennent Bagdad. Cela ne signifie pas la disparition de l’islam.',category='repères')
choice('H5','tribut','Dans l’exemple d’Alexandrie, qu’est-ce qu’un tribut ?','Une somme versée au vainqueur',['Un lieu de prière','Une capitale','Une alliance par mariage'],'Le dirigeant d’Alexandrie accepte de payer un tribut au vainqueur.',category='mots')
typed('H5','642','En quelle année l’Égypte est-elle conquise dans le cours ?','642','Le cours donne 642 pour la conquête de l’Égypte.')

typed('H6','grec','Quelle langue est utilisée dans l’Empire byzantin ?','Le grec','Les documents du cours montrent l’usage du grec.')
typed('H6','capitale','Quelle est la capitale de l’Empire byzantin ?','Constantinople','Constantinople est la capitale de l’Empire byzantin.',accepted=['Constantinople','Byzance'])
typed('H6','1453','En quelle année l’Empire byzantin disparaît-il ?','1453','L’Empire byzantin prolonge l’Empire romain d’Orient jusqu’en 1453.')
choice('H6','heritage','L’Empire byzantin prolonge quelle partie de l’Empire romain ?','L’Empire romain d’Orient',['L’Empire romain d’Occident','L’Empire carolingien','Le califat abbasside'],'L’Empire romain d’Orient a survécu à la disparition de l’Occident.')
choice('H6','irene','Qui gouverne l’Empire byzantin de 797 à 802 ?','L’impératrice Irène',['Théodora','Charlemagne','Haroun al-Rachid'],'Le document sur Irène donne les dates 797–802.',category='personnages')

typed('H7','800','En quelle année Charlemagne devient-il empereur ?','800','Le pape couronne Charlemagne le 25 décembre 800.',accepted=['800','25 décembre 800','le 25 décembre 800'])
typed('H7','rome','Dans quelle ville Charlemagne est-il couronné ?','Rome','Le couronnement a lieu à Rome le 25 décembre 800.')
typed('H7','aix','Dans quelle ville se trouve le palais de Charlemagne ?','Aix-la-Chapelle','Charlemagne fait bâtir un palais et une chapelle à Aix-la-Chapelle.',accepted=['Aix-la-Chapelle','Aix la Chapelle','Aachen'])
choice('H7','pape','Qui couronne Charlemagne empereur ?','Le pape',['Le patriarche de Constantinople','Le calife Al-Mansur','Le général Bélisaire'],'Le couronnement par le pape montre le lien entre pouvoir impérial et christianisme.',category='personnages')
choice('H7','fragilite','Qu’est-ce qui fragilise l’Empire carolingien après Charlemagne ?','Les partages entre les héritiers',['La fondation de Constantinople','La construction de Sainte-Sophie','L’Hégire'],'Les partages entre héritiers provoquent des difficultés de succession.')

choice('H8','alliance','Des empires de religions différentes peuvent-ils chercher à s’allier ?','Oui, comme Charlemagne et Haroun al-Rachid',['Non, ils sont toujours en guerre','Oui, mais seulement après 1453','Non, aucun envoyé ne voyage'],'Le cours présente une recherche d’alliance vers 800 entre Charlemagne et le calife.')
typed('H8','haroun','Quel calife cherche une alliance avec Charlemagne ?','Haroun al-Rachid','Haroun al-Rachid est le calife abbasside étudié dans le cours.',accepted=['Haroun al-Rachid','Haroun al Rachid','Harun al-Rashid','Haroun','Harun'],category='personnages')
choice('H8','envoye','Quel est le rôle d’un envoyé ?','Représenter son souverain auprès d’un autre dirigeant',['Diriger tous les empires','Remplacer le livre sacré','Tracer une nouvelle frontière seul'],'Les envoyés permettent aux dirigeants de communiquer et de chercher des alliances.',category='mots')
typed('H8','elephant','Quel animal apparaît dans la miniature sur les relations entre les empires ?','Un éléphant','La miniature étudiée représente notamment un envoyé du calife et un éléphant.',accepted=['éléphant','un éléphant'])

typed('H9','1095','En quelle année le pape Urbain II appelle-t-il à la croisade ?','1095','1095 correspond à l’appel à la croisade ; 1099 à la prise de Jérusalem par les croisés.')
typed('H9','1099','En quelle année les croisés prennent-ils Jérusalem ?','1099','Les croisés prennent Jérusalem en 1099 et fondent les États latins d’Orient.')
typed('H9','urbain','Quel pape appelle à la croisade en 1095 ?','Urbain II','Urbain II lance l’appel à la croisade en 1095.',accepted=['Urbain II','Urbain 2','le pape Urbain II','Urbain'],category='personnages')
choice('H9','templiers','Quelle est la mission des Templiers dans le cours ?','Protéger les pèlerins qui vont à Jérusalem',['Fonder Bagdad','Couronner Charlemagne','Écrire le Coran'],'Les Templiers sont des chevaliers religieux qui protègent les pèlerins.')
choice('H9','financement','Comment les Templiers financent-ils leurs activités ?','Grâce aux dons et aux terres qu’ils reçoivent',['Grâce à la fondation de Constantinople','Grâce au Code de Justinien','Grâce à un couronnement à Bagdad'],'Le cours mentionne des dons et des terres pour financer leurs activités.')
choice('H9','relations','Quelles relations existent entre chrétiens et musulmans ?','Des conflits, mais aussi du commerce et des échanges culturels',['Seulement des guerres','Seulement du commerce','Aucune relation'],'Les croisades ne résument pas toutes les relations : il existe aussi des échanges.')
typed('H9','saladin','Quel chef musulman cité dans le cours reprend des territoires aux croisés ?','Saladin','Le cours cite Saladin parmi les chefs musulmans qui reprennent des territoires.',category='personnages')

typed('H11','1054','En quelle année a lieu le schisme étudié dans le cours ?','1054','Le schisme de 1054 marque une rupture entre les Églises catholique et orthodoxe.')
typed('H11','schisme','Quel mot désigne une rupture entre deux Églises ?','Un schisme','Un schisme est une séparation ou une rupture entre des Églises.',accepted=['schisme','un schisme'],category='mots')
typed('H11','patriarche','Quel est le titre du grand chef religieux de Constantinople ?','Le patriarche','Le patriarche de Constantinople est un grand chef religieux.',accepted=['patriarche','le patriarche','patriarche de Constantinople','le patriarche de Constantinople'],category='personnages')
choice('H11','causes','Quels désaccords opposent Rome et Constantinople ?','Les pratiques religieuses et l’autorité du pape',['La fondation de Bagdad et le Bosphore','Les cinq piliers et l’Hégire','Les terres des Templiers et les héritiers de Charlemagne'],'Les pratiques religieuses et l’autorité du pape sont deux causes de l’opposition.')
choice('H11','chretiens','Après le schisme, catholiques et orthodoxes…','restent deux groupes chrétiens.',['deviennent tous musulmans.','n’ont plus aucune religion.','appartiennent à l’Empire carolingien.'],'La rupture oppose deux Églises qui restent chrétiennes.')
choice('H11','point-de-vue','Le document H11 critiquant les prêtres d’Orient présente quel point de vue ?','Celui des représentants du pape',['Celui du calife','Un point de vue totalement neutre','Celui des Templiers'],'Les auteurs représentent le pape et critiquent leurs adversaires : il faut identifier ce point de vue.')

assert len({q['id'] for q in QUESTIONS}) == len(QUESTIONS)
assert {q['topic'] for q in QUESTIONS} == {x['id'] for x in lessons}
for q in QUESTIONS:
    if q['type']=='choice':
        assert len(set(q['options']))==4 and q['answer'] in q['options']
# Byzance is the earlier name of the site, not the expected medieval capital name.
next(q for q in QUESTIONS if q['id']=='H6-capitale')['accepted']=['Constantinople']
payload={'lessons':lessons,'questions':QUESTIONS,'version':1}
(OUT/'content.mjs').write_text('export const CONTENT = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps({'lessons':len(lessons),'questions':len(QUESTIONS),'types':{t:sum(q['type']==t for q in QUESTIONS) for t in ['text','choice']}},ensure_ascii=False))
