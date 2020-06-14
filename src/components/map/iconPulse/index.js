const { L } = window;

(function(window) {
  let pulseMarker = null;
  L.Icon.Pulse = L.DivIcon.extend({

    options: {
      className: '',
      iconSize: [12, 12],
      fillColor: 'rgbr(0,0,0,0)',
      color: '#0000ff',
      animate: true,
      heartbeat: 1,
      offsetx: '50px',
      offsety: '50px',
    },

    initialize: function(options) {
      L.setOptions(this, options);

      // css

      var uniqueClassName = 'lpi-' + new Date().getTime() + '-' + Math.round(Math.random() * 100000);

      var before = ['background-color: ' + this.options.fillColor];
      var after = [

        `box-shadow: 0 0 ${this.options.offsetx} ${this.options.offsety} ${this.options.color}  ${this.options.inset ? ' inset' : ''}`,

        'animation: pulsate ' + this.options.heartbeat + 's ease-out',
        'animation-iteration-count: infinite',
        'animation-delay: ' + (this.options.heartbeat + .1) + 's',
        'position:absolute',
        'left:0',
        'opacity: 0.3'
      ];

      if (!this.options.animate) {
        after.push('animation: none');
      }

      if (!this.options.shadow) {
        after.push('box-shadow:none');
      }

      var css = [
        '.' + uniqueClassName + '{' + before.join(';') + ';}',
        '.' + uniqueClassName + ':after{' + after.join(';') + ';}',
      ].join('');

      var el = document.createElement('style');
      if (el.styleSheet) {
        el.styleSheet.cssText = css;
      } else {
        el.appendChild(document.createTextNode(css));
      }

      document.getElementsByTagName('head')[0].appendChild(el);

      // apply css class

      this.options.className = this.options.className + ' leaflet-pulsing-icon ' + uniqueClassName;

      // initialize icon
      L.DivIcon.prototype.initialize.call(this, options);
    }
  });

  L.icon.pulse = function(options) {
    return new L.Icon.Pulse(options);
  };


  L.Marker.Pulse = L.Marker.extend({
    initialize: function(latlng, options) {
      options.icon = L.icon.pulse(options);
      L.Marker.prototype.initialize.call(this, latlng, options);
    }
  });

  L.marker.pulse = function(latlng, options) {
    pulseMarker = new L.Marker.Pulse(latlng, options);
    return pulseMarker;
  };

})(window);
