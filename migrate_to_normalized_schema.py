#!/usr/bin/env python3
import json
import re

with open('careers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def parse_salary(salary_str):
    if not salary_str or salary_str in ['Variable', 'N/A']:
        return {'min': None, 'max': None}

    salary_str = str(salary_str).replace('$', '').strip()
    match = re.search(r'(\d+)k?[–-](\d+)k?', salary_str)
    if match:
        min_val = int(match.group(1)) * 1000
        max_val = int(match.group(2)) * 1000
        return {'min': min_val, 'max': max_val}

    return {'min': None, 'max': None}

def parse_cost(cost_val):
    if cost_val is None:
        return {'min': None, 'max': None}
    return {'min': cost_val, 'max': cost_val}

def parse_education(edu_str):
    if not edu_str:
        return {
            'degrees': [{'level': 'undergraduate', 'names': ['Bachelor'], 'us_years': 4, 'eu_years': 3, 'norm': 'required'}],
            'requirement_summary': 'Bachelor required'
        }

    edu_lower = edu_str.lower()
    degrees = []
    summary_parts = []

    # Bachelor
    if 'bachelor' in edu_lower:
        norm = 'optional' if 'optional' in edu_lower else 'required'
        degrees.append({'level': 'undergraduate', 'names': ['Bachelor'], 'us_years': 4, 'eu_years': 3, 'norm': norm})
        summary_parts.append('Bachelor ' + norm)
    else:
        degrees.append({'level': 'undergraduate', 'names': ['Bachelor'], 'us_years': 4, 'eu_years': 3, 'norm': 'required'})
        summary_parts.append('Bachelor required')

    # Master
    if 'master' in edu_lower:
        if 'typical' in edu_lower or 'helpful' in edu_lower:
            norm = 'typical'
        elif 'optional' in edu_lower:
            norm = 'optional'
        else:
            norm = 'required'
        degrees.append({'level': 'graduate', 'names': ['Master'], 'prerequisite': 'Bachelor', 'us_years': 2, 'eu_years': 2, 'norm': norm})
        summary_parts.append('Master ' + norm)

    # Professional (MD, JD, DVM)
    prof_map = {'md': 'MD', 'do': 'DO', 'jd': 'JD', 'dvm': 'DVM', 'dds': 'DDS'}
    for key, name in prof_map.items():
        if key in edu_lower:
            norm = 'optional' if 'optional' in edu_lower else 'required'
            degrees.append({'level': 'professional', 'names': [name], 'prerequisite': 'Bachelor', 'us_years': 4, 'eu_years': 4, 'norm': norm})
            summary_parts.append(name + ' ' + norm)
            break

    # PhD
    if 'phd' in edu_lower:
        if 'research' in edu_lower:
            norm = 'optional'
        elif 'typical' in edu_lower:
            norm = 'typical'
        elif 'optional' in edu_lower:
            norm = 'optional'
        else:
            norm = 'required'
        degrees.append({'level': 'doctoral', 'names': ['PhD'], 'prerequisite': 'Bachelor', 'us_years': 5, 'eu_years': 4, 'norm': norm})
        summary_parts.append('PhD ' + norm)

    # Residency
    if 'residency' in edu_lower:
        norm = 'optional' if 'optional' in edu_lower else 'required'
        degrees.append({'level': 'postdegree', 'names': ['Residency'], 'prerequisite': 'MD', 'us_years': '3-7', 'eu_years': '3-7', 'norm': norm})
        summary_parts.append('Residency ' + norm)

    summary = ', '.join(summary_parts) if summary_parts else 'Bachelor required'

    return {'degrees': degrees, 'requirement_summary': summary}

def parse_licensing(lic_str):
    if not lic_str or lic_str in ['Not required', 'No']:
        return {'status': 'not_available', 'type': None, 'scope': 'us', 'qualifier': None}

    lic_lower = lic_str.lower()
    status = 'required'
    types = []
    scope = 'us'
    qualifier = None

    if 'not required' in lic_lower or lic_str == 'No':
        status = 'not_available'
    elif 'optional' in lic_lower or 'rarely' in lic_lower:
        status = 'optional'

    for t in ['pe', 'cpa', 'cfa', 'nclex', 'usmle', 'bar', 'lcsw', 'otr', 'rd', 'rdn']:
        if t in lic_lower:
            types.append(t.upper())

    if 'country' in lic_lower or 'varies' in lic_lower:
        scope = 'country_specific'
    elif 'state' in lic_lower:
        scope = 'state'
    elif 'global' in lic_lower or 'international' in lic_lower:
        scope = 'global'

    if '–' in lic_str:
        parts = lic_str.split('–')
        if len(parts) > 1:
            qualifier = parts[1].strip()
    elif '(' in lic_str and ')' in lic_str:
        match = re.search(r'\((.*?)\)', lic_str)
        if match:
            qualifier = match.group(1)

    return {
        'status': status,
        'type': types if types else None,
        'scope': scope,
        'qualifier': qualifier
    }

def parse_portability(port_str):
    if not port_str:
        return {'level': 'MEDIUM', 'qualifier': None}

    port_upper = port_str.upper()
    level = 'MEDIUM'
    qualifier = None

    if 'HIGH' in port_upper:
        level = 'HIGH'
    elif 'LOW' in port_upper:
        level = 'LOW'

    if '–' in port_str:
        parts = port_str.split('–')
        if len(parts) > 1:
            qualifier = parts[1].strip()
    elif '(' in port_str and ')' in port_str:
        match = re.search(r'\((.*?)\)', port_str)
        if match:
            qualifier = match.group(1)

    return {'level': level, 'qualifier': qualifier}

# Migrate all careers
migrated = 0
for cat_key, category in data.items():
    for career_name, career_data in category.get('subjects', {}).items():

        if 'salaryUS' in career_data:
            s = parse_salary(career_data.get('salaryUS'))
            career_data['salaryUS_min'] = s['min']
            career_data['salaryUS_max'] = s['max']
            del career_data['salaryUS']

        if 'salaryEU' in career_data:
            s = parse_salary(career_data.get('salaryEU'))
            career_data['salaryEU_min'] = s['min']
            career_data['salaryEU_max'] = s['max']
            del career_data['salaryEU']

        if 'costUS' in career_data:
            c = parse_cost(career_data.get('costUS'))
            career_data['costUS_min'] = c['min']
            career_data['costUS_max'] = c['max']
            del career_data['costUS']

        if 'costEU' in career_data:
            c = parse_cost(career_data.get('costEU'))
            career_data['costEU_min'] = c['min']
            career_data['costEU_max'] = c['max']
            del career_data['costEU']

        if 'education' in career_data:
            career_data['education'] = parse_education(career_data.get('education', ''))

        if 'licensing' in career_data:
            career_data['licensing'] = parse_licensing(career_data.get('licensing', ''))

        if 'portability' in career_data:
            career_data['portability'] = parse_portability(career_data.get('portability', ''))

        if 'demand' in career_data and isinstance(career_data['demand'], dict):
            if 'period' in career_data['demand']:
                del career_data['demand']['period']

        migrated += 1

with open('careers.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Migrated " + str(migrated) + " careers to normalized schema")
print("careers.json updated successfully")
