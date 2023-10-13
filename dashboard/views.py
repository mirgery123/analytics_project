from django.http import JsonResponse
from django.shortcuts import render
from django.db import connection
import logging

def home_view(request):
    selected_state = str(request.GET.get('estadoCombo', 'ALL'))
    logger = logging.getLogger()
    logger.debug(f'GET Home')
    logger.debug(f'Selected State: {selected_state}')

    #Almacena el estado seleccionado en la sesión
    request.session['selected_state'] = selected_state

    context = {'state': selected_state}
    return render(request, 'index.html', context)

def output(request):
    return render(request, 'output.html')

def simplechart(request):
    state = str(request.session.get('selected_state', 'ALL'))
    logger = logging.getLogger()
    logger.debug(f'simplechart state: {state}')
    cursor = connection.cursor()

    if state == "ALL":
        query = """
        SELECT 
            "ALL" As state,
            gender, 
            COUNT(id) AS count,
            (SUM(fraud_flag)*1.0 / COUNT(id)*1.0)*100 As percent
        FROM 
            dashboard_ddata 
        GROUP BY 
            gender
        """
    else:
        query = """
        SELECT 
            state,
            gender, 
            COUNT(id) AS count,
            (SUM(fraud_flag)*1.0 / COUNT(id)*1.0)*100 As percent
        FROM 
            dashboard_ddata
        WHERE
            state = '{}'
        GROUP BY 
            gender
        """.format(state)
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def bubblechart(request):
    state = str(request.session.get('selected_state', 'ALL'))
    logger = logging.getLogger()
    logger.debug(f'bubblechart state: {state}')
    cursor = connection.cursor()

    if state == "ALL":
        query = """
        SELECT 
            state, 
            (SUM(fraud_flag)*1.0 / COUNT(id)*1.0)*100 As percent, 
            COUNT(DISTINCT id) AS claim_count, 
            COUNT(DISTINCT provider) As prov_count,
            SUM(total_net_amount) AS total_net_amount,
            IIF(state>50, '51-54', (IIF(state>40, '41-50', IIF(state>30, '31-40', IIF(state>20, '21-30', IIF(state>10, '11-20', '1-10')))))) AS region
        FROM 
            dashboard_ddata 
        GROUP 
            BY state;
        """.format(state)
    else:
        query = """
        SELECT 
            state, 
            (SUM(fraud_flag)*1.0 / COUNT(id)*1.0)*100 As percent, 
            COUNT(DISTINCT id) AS claim_count, 
            COUNT(DISTINCT provider) As prov_count,
            SUM(total_net_amount) AS total_net_amount,
            IIF(state>50, '51-54', (IIF(state>40, '41-50', IIF(state>30, '31-40', IIF(state>20, '21-30', IIF(state>10, '11-20', '1-10')))))) AS region
        FROM 
            dashboard_ddata
        WHERE 
            state = '{}'
        GROUP 
            BY state;
        """.format(state)
    cursor.execute(query)
    print(connection.queries)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)


def donutchart(request):
    state = str(request.session.get('selected_state', 'ALL'))
    createTopTen(state)
    logger = logging.getLogger()
    logger.debug(f'donutchart state: {state}')
    createTopTen
    cursor = connection.cursor()

    # Construye la consulta SQL dinámica usando el valor de state
    if state == "ALL":
        query = """
        SELECT
            CASE
                WHEN d.provider IN (SELECT provider FROM top10_prov) THEN 'Top 10'
                WHEN d.fraud_flag = 1 THEN 'Other Fraud'
                ELSE 'Non-fraud'
            END AS category,
            CASE
                WHEN d.provider IN (SELECT provider FROM top10_prov) THEN 1
                WHEN d.fraud_flag = 1 THEN 2
                ELSE 3
            END AS order_cat,
            SUM(d.total_net_amount) AS total_net_amount,
            COUNT(d.claim) AS clm_cnt, 
            COUNT(DISTINCT d.provider) AS prov_cnt,
            "ALL" As state
        FROM
            dashboard_ddata AS d
        GROUP BY
            category
        ORDER BY
            order_cat ASC;
        """
    else:
        query = """
        SELECT 
            CASE
                WHEN d.provider IN (SELECT provider FROM top10_prov) THEN 'Top 10'
                WHEN d.fraud_flag = 1 THEN 'Other Fraud'
                ELSE 'Non-fraud'
            END AS category,
            CASE
                WHEN d.provider IN (SELECT provider FROM top10_prov) THEN 1
                WHEN d.fraud_flag = 1 THEN 2
                ELSE 3
            END AS order_cat,
            SUM(d.total_net_amount) AS total_net_amount,
            COUNT(d.claim) AS clm_cnt,
            COUNT(DISTINCT d.provider) AS prov_cnt,
            d.state As state
        FROM 
            dashboard_ddata AS d
        WHERE 
            d.state = '{}'
        GROUP BY 
            category
        ORDER BY
            order_cat ASC;
        """.format(state)
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def stackbarchart(request):
    state = str(request.session.get('selected_state', 'ALL'))
    logger = logging.getLogger()
    logger.debug(f'stackbarchart state: {state}')
    cursor = connection.cursor()

    if state == "ALL":
        query = """
        SELECT
            "ALL" As state,
            state As county,
            AVG(total_net_amount) AS avg_total_net_amount,
            AVG(IIF(fraud_flag=0, total_net_amount, 0)) As cat1,
            AVG(IIF(fraud_flag=1, total_net_amount, 0)) As cat2
        FROM   
            dashboard_ddata 
        GROUP BY 
            state
        ORDER BY 
            state;
        """
    else:
        query = """
        SELECT
            state,
            county,
            AVG(total_net_amount) AS avg_total_net_amount,
            AVG(IIF(fraud_flag=0, total_net_amount, 0)) As cat1,
            AVG(IIF(fraud_flag=1, total_net_amount, 0)) As cat2
        FROM   
            dashboard_ddata
        WHERE
            state = '{}'
        GROUP BY 
            state, county
        ORDER BY 
            state, county;
        """.format(state)
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def viz6(request):
    cursor = connection.cursor()
    query = """
    SELECT
        state,
        county,
        fraud_flag,
        is_predicted,
        IIf(fraud_flag=1,IIf(is_predicted=1,"Predicted Potential Fraud","Potential Fraud"),"Not Fraud") AS cat,
        AVG(total_net_amount) AS avg_total_net_amount
    FROM
        dashboard_ddata
    WHERE is_predicted=0 and fraud_flag=1
    GROUP BY 
        state, county, cat
    ORDER BY 
        state, county, cat;
    """
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def barchart(request):
    cursor = connection.cursor()
    query = """
    SELECT
        state,
        county,
        AVG(total_net_amount) AS avg_total_net_amount
    FROM
        dashboard_ddata
    WHERE
        state=2
    GROUP BY 
        state, county
    ORDER BY 
        state, county;
    """
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def groupbarchart(request):
    cursor = connection.cursor()
    query = """
    SELECT
        state,
        county,
        IIf(fraud_flag=1, "Potential Fraud", "Not Fraud") AS cat,
        AVG(total_net_amount) AS avg_total_net_amount
    FROM
        dashboard_ddata
    WHERE 
        state=2
    GROUP BY 
        state, county, cat
    ORDER BY 
        state, county, cat;
    """
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def timeline_chart(request):
    # Obtén el valor de estadoCombo de la solicitud AJAX anterior (capturado en mi_vista)
    state = str(request.session.get('selected_state', 'ALL'))
    logger = logging.getLogger()
    logger.debug(f'timeline_chart state: {state}')
    cursor = connection.cursor()

    # Construye la consulta SQL dinámica usando el valor de state
    if state == "ALL":
        query = """
        SELECT 
            strftime('%m/01/%Y', claim_start_date) As month,
            COUNT(DISTINCT provider) As fraud_prov_count
        FROM 
            dashboard_ddata 
        WHERE
            fraud_flag = 1
        GROUP BY 
            month
        ORDER BY
            month
        """
    else:
        query = """
        SELECT 
            strftime('%m/01/%Y', claim_start_date) As month,
            COUNT(DISTINCT provider) As fraud_prov_count
        FROM 
            dashboard_ddata 
        WHERE
            fraud_flag = 1
            AND state = '{}'
        GROUP BY 
            month
        ORDER BY
            month
        """.format(state)

    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)


def allstates(request):
    cursor = connection.cursor()
    query = """
    SELECT
        state
    FROM
        dashboard_ddata
    GROUP BY 
        state
    ORDER BY 
        state
    """
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)

def update_data(request):
    estado_combo = request.GET.get('estadoCombo', 'ALL')
    #print(f'Valor de estadoCombo: {estado_combo}') 
    logger = logging.getLogger()
    logger.debug(f'Valor de estado_combo: {estado_combo}')
    selected_state = {'selected_state': estado_combo}
    return JsonResponse(selected_state)

def selected_state(request):
    estado_combo = request.GET.get('estadoCombo', 'ALL')
    #print(f'Valor de estadoCombo: {estado_combo}') 
    logger = logging.getLogger()
    logger.debug(f'Valor de selected state 2: {estado_combo}')
    selected_state = {'selected_state': estado_combo}
    return JsonResponse(selected_state)

def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """    
    header = [col[0] for col in cursor.description]
    return [dict(zip(header, row)) for row in cursor.fetchall()]

#create table for top 10 fraudulent providers
def createTopTen(state):
    logger = logging.getLogger()
    logger.debug(f'create top10 state: {state}')

    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS top10_prov;")

        if state == "ALL":
            query = """
                CREATE TABLE top10_prov AS
                    SELECT
                        provider
                    FROM
                        dashboard_ddata
                    WHERE 
                        fraud_flag = 1
                    GROUP BY
                        provider
                    ORDER BY
                        AVG(total_net_amount) DESC
                    LIMIT 10;
            """
        else:
            query = """
            CREATE TABLE top10_prov AS
                SELECT
                    provider
                FROM
                    dashboard_ddata
                WHERE 
                    fraud_flag = 1
                    AND state = '{}'
                GROUP BY
                    provider
                ORDER BY
                    AVG(total_net_amount) DESC
                LIMIT 10;
            """.format(state)
        cursor.execute(query)

def stackbarchart2(request):
    cursor = connection.cursor()
    query = """
    SELECT
        state,
        county,
        AVG(total_net_amount) AS avg_total_net_amount,
        AVG(IIF(fraud_flag=0, total_net_amount, 0)) As cat1,
        AVG(IIF(fraud_flag=1, total_net_amount, 0)) As cat2
    FROM   
        dashboard_ddata 
    GROUP BY 
        state, county
    ORDER BY 
        state, county;
    """
    cursor.execute(query)
    data = dictfetchall(cursor)
    return JsonResponse(data, safe=False)