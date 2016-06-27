$(document).ready(function(){

  const RELOAD = 1000*60;  // millis in which data will reload

  var table = $('#status').DataTable({
    ajax: '/api/bluemix',
    columns: [
        {data: 'name'},
        {data: 'space.name'},
        {data: 'instance_count'},
        {data: 'state'}
      ],
    paging: false,
    dom: 'lrti'
  });

  $('form.navbar-form input').keyup(function(){
    $('#status').dataTable().api().search(this.value).draw();
  });

  var displayCharts = function() {
    var section = $('div.charts').empty(),
      instanceTr = $(this),
      instanceId = instanceTr.find('.id').data('id'),
      appTr = $(this).parents('tr').prev(),
      row = $('#status').dataTable().api().row(appTr);
      app = row.data(),
      instance = app.instances[instanceId],
      metrics = {
        memory: {
          label: 'Memory',
          units: 'MB',
          threshold: {
            units: 'value'
          },
          quota: {
            display: numeral(instance.stats.mem_quota).format('0.0 b'),
            value: instance.stats.mem_quota,
            chart: (instance.stats.mem_quota / (Math.pow(1024, 2))).toFixed(1) // Megabytes
          },
          current: {
            display: numeral(instance.stats.usage.mem).format('0.0 b'),
            value: instance.stats.usage.mem,
            chart:  (instance.stats.usage.mem / (Math.pow(1024, 2))).toFixed(1)  // Megabytes
          }
        },
        cpu: {
          label: 'CPU',
          units: '%',
          threshold: {
            units: 'percentage'
          },
          quota: {
            display: '100%',
            value: 100,
            chart: 100
          },
          current: {
            display: numeral(instance.stats.usage.cpu).format('0.0%'),
            value: instance.stats.usage.cpu,
            chart: (instance.stats.usage.cpu * 100).toFixed(2)
          }
        },
        disk: {
          label: 'Disk',
          units: 'GB',
          threshold: {
            units: 'value'
          },
          quota: {
            display: numeral(instance.stats.disk_quota).format('0.0 b'),
            value: instance.stats.disk_quota,
            chart: (instance.stats.disk_quota / (Math.pow(1024, 3))).toFixed(2) // Gigabytes
          },
          current: {
            display: numeral(instance.stats.usage.disk).format('0.0 b'),
            value: instance.stats.usage.disk,
            chart: (instance.stats.usage.disk / (Math.pow(1024, 3))).toFixed(2) // Gigabytes
          }
        }
      };

    var row = $('<div/>', {class: 'row'}).appendTo(section),
      title = $('<h3/>', {
        text: 'Application: ' + app.name.toUpperCase()
      }).appendTo(row),
      spaceTxt = $('<div/>', {
        class: 'text-muted',
        text: 'Space: ' + app.space.name.toUpperCase()
      }).appendTo(row),
      instanceTxt = $('<div/>', {
        class: 'text-muted',
        text: 'Instance #' + instanceId.toString()
      }).appendTo(row);

    instance.stats.uris.forEach(function(uri){
      $('<div/>').append(
        $('<a>', {
          text: uri,
          class: 'text-muted',
          href: '//' + uri,
          target: '_blank'})
      ).appendTo(row);
    });

    $.each(metrics, function(id, stat){
      // Create elements for new charts
      var container = $('<div/>', {class:'col-xs-3 col-sm-3 charts'}),
        chartDiv = $('<div/>', {id: id}).appendTo(container),
        title = $('<h4/>', {text: stat.label}).appendTo(container),
        subtitle = $('<span/>', {
          class: 'text-muted',
          text: stat.current.display + ' of ' + stat.quota.display
        }).appendTo(container);

      $(section).append(container);

      // Load data
      var colors = {
        green: {
          color: '#60B044',
          value: 0.6 * stat.quota.value
        },
        yellow: {
          color: '#F6C600',
          value: 0.7 * stat.quota.value
        },
        orange: {
          color: '#F97600',
          value: 0.8 * stat.quota.value
        },
        red: {
          color: '#FF0000',
          value: 0.9 * stat.quota.value
        }
      };

      var chart = c3.generate({
        bindto: '#' + id,
        type: 'gauge',
        gauge: {
          label: stat.label,
          units: stat.units,
          max: stat.quota.chart,
        },
        color: {
           pattern: [colors.green.color, colors.yellow.color, colors.orange.color, colors.red.color ], // the three color levels for the percentage values.
           threshold: {
               unit: stat.threshold.units, // percentage is default
               max: stat.quota.value,
               values: [colors.green.value, colors.yellow.value, colors.orange.value, colors.red.value]
           }
        },
        data: {
          type: 'gauge',
          columns: [[stat.label, stat.current.chart]]
        }
      });
    });
  }


  var displayInstances = function(){
    var tr = $(this),
      row = $('#status').dataTable().api().row(tr);

    if ( row.child.isShown() ) {
      $('div.charts').empty();
      row.child.hide();
    }
    else {
      var data = row.data();
      if (data.instances) {
        var instanceTable = $('<table/>', {class: 'table table-hover table-condensed'}),
          thead = $('<thead/>'),
          headrow = $('<tr/>'),
          tbody = $('<tbody/>');
        thead.appendTo(instanceTable);
        tbody.appendTo(instanceTable);
        headrow.appendTo(thead);
        $('<th>', {text: 'Instance'}).appendTo(headrow),
        $('<th>', {text: 'State'}).appendTo(headrow);
        $('<th>', {text: 'Uptime'}).appendTo(headrow);

        $.each(data.instances, function(id, instance){
          var datarow = $('<tr/>'),
            uptime = moment.duration(instance.stats.uptime, 'seconds').humanize();
          $('<td/>', {text: id.toString(), 'data-id': id, class: 'id'}).appendTo(datarow);
          $('<td/>', {text: instance.state}).appendTo(datarow);
          $('<td/>', {text: uptime}).appendTo(datarow);
          datarow.click(displayCharts);
          datarow.appendTo(tbody);
        });
        row.child(instanceTable).show();
      }
    }
  }

  $('#status tbody').on('click', 'tr', displayInstances);

  setInterval( function () {
    table.ajax.reload();
  }, RELOAD );
});
