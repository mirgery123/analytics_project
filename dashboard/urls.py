from django.urls import path
from . import views

app_name = "dashboard"
urlpatterns = [
    path('', views.home_view, name="home"),
    path('simplechart/', views.simplechart, name='simplechart'),
    path('output/', views.output, name='output'),
    path('bubblechart/', views.bubblechart, name='bubblechart'),
    path('donutchart/', views.donutchart, name='donutchart'),
    path('viz6/', views.viz6, name='viz6'),
    path('barchart/', views.barchart, name='barchart'),
    path('stackbarchart/', views.stackbarchart, name='stackbarchart'),
    path('groupbarchart/', views.groupbarchart, name='groupbarchart'),
    path('timeline_chart/', views.timeline_chart, name='timeline_chart'),
    path('allstates/', views.allstates, name='allstates'),
    path('update_data/', views.update_data, name='update_data'),
    path('stackbarchart2/', views.stackbarchart, name='stackbarchart'),
]