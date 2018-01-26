$(function() {

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2010 Q1',
            'Pedidos Finalizados': 2666,
            'Cancelados': 10
        }, {
            period: '2010 Q2',
            'Pedidos Finalizados': 2778,
            'Cancelados': 12
        }, {
            period: '2010 Q3',
            'Pedidos Finalizados': 4912,
            'Cancelados': 9
        }, {
            period: '2010 Q4',
            'Pendentes': 3597,
            'Cancelados': 11
        }, {
            period: '2011 Q1',
            'Pedidos Finalizados': 6810,
            'Cancelados': 11
        }, {
            period: '2011 Q2',
            'Pedidos Finalizados': 5670,
            'Cancelados': 8
        }, {
            period: '2011 Q3',
            'Pedidos Finalizados': 4820,
            'Cancelados': 10
        }, {
            period: '2011 Q4',
            'Pedidos Finalizados': 1900,
            'Cancelados': 13
        }, {
            period: '2012 Q1',
            'Pedidos Finalizados': 2000,
            'Cancelados': 10
        }, {
            period: '2012 Q2',
            'Pedidos Finalizados': 1800,
            'Cancelados': 30
        }],
        xkey: 'period',
        ykeys: ['Pedidos Finalizados', 'Cancelados'],
        labels: ['Pedidos Finalizados', 'Cancelados'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2006',
            a: 100,
            b: 90
        }, {
            y: '2007',
            a: 75,
            b: 65
        }, {
            y: '2008',
            a: 50,
            b: 40
        }, {
            y: '2009',
            a: 75,
            b: 65
        }, {
            y: '2010',
            a: 50,
            b: 40
        }, {
            y: '2011',
            a: 75,
            b: 65
        }, {
            y: '2012',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });
    
});
