/**
 * @author SowingSadness
 * @mail sowingsadness@gmail.com
 */
var $ = window.jQuery ? window.jQuery : {};
//( function( $, document, undefined ) {

	var arrKeyCodes = {
		"tab"	: 9,
		"enter"	: 13,
		"left"	: 37,
		"up"	: 38,
		"right"	: 39,
		"down"	: 40
	};

	function getDataAttrs( $Object ) {
		var prefix = 'data-';
		var oAttrsData = {};
		var sAttrs = $Object[0].attributes;
		if ( sAttrs !== undefined ) {
			for ( var i=0; i < sAttrs.length; i++ ) {
				if ( sAttrs[i].name.substr( 0, prefix.length ).toLowerCase() === prefix ) {
					var sAttrName = sAttrs[i].name.substr( prefix.length );
					oAttrsData[sAttrName] = sAttrs[i].textContent ? sAttrs[i].textContent : sAttrs[i].value ;
				}
			}
		}

		return oAttrsData;
	}

	function prepareData( $Object ) {
		//var $optionGroups = $select.children( 'optgroup' );
		var arrOptionData = [];
		$Object.each( function( nIndex, domElement ) {
			$oItem = $( domElement );
			var oData = {
				name: $oItem.text(),
				value: $oItem.val()
			};
			var aExtendData = getDataAttrs( $oItem );
			$.extend( oData, aExtendData );
			arrOptionData.push( oData );
		});

		return arrOptionData;
	}

	function shiftItemActivity( pluginObj, direction ) {
		var selectShift, slectorShift;
		if ( direction === 'next' ) {
			selectShift = function ( $activeItem ) { return $activeItem.nextAll( ':visible:first' ); }; //next not work
			slectorShift = ':visible:first';
		} else {
			selectShift = function ( $activeItem ) { return $activeItem.prevAll( ':visible:first' ); };
			slectorShift = ':visible:last';
		}

		var $activeItem = pluginObj.jobjects.itemList.children( '.active' );
		if ( $activeItem.length === 0 ) {
			$activeItem = pluginObj.jobjects.itemList.children( slectorShift );
		} else {
			$activeItem.removeClass( 'active' );
			var $shiftItem = selectShift( $activeItem );

			if ( $shiftItem.length === 0 ) {
				$activeItem = pluginObj.jobjects.itemList.children( slectorShift );
			} else {
				$activeItem = $shiftItem;
			}
		}
		if ( $activeItem.length > 0 ) {
			$activeItem.addClass( 'active' );
		}
	}

	var pluginObject = {
		options: {
			'templateList'	:	'<ul></ul>',
			'templateItem'	:	'<li data-value="${value}" data-filter="${name}">${name}</li>',
			'width'			:	'241px',
			'height'		:	'22px',
			'tabindex'		:	false,
			'allowInput'	:	true,
			'maxVisibleItems' : 8
		},
		/**
		 * jQuery.ui.widget::destroy()
		 */
		destroy: function() {
			//$.Widget.prototype.destroy.apply( this, arguments ); // default destroy
			// now do other stuff particular to this widget
		},
		_keyHook: function ( event ) {
			switch ( event.keyCode ) {
				case arrKeyCodes.right:
					//вправо
					break;
				case arrKeyCodes.left:
					//влево
					break;
				case arrKeyCodes.down:
					//вниз
					shiftItemActivity( this, 'next' );
					this._reposScrollArea( event );
					break;
				case arrKeyCodes.up:
					//вверх
					shiftItemActivity( this, 'prev' );
					this._reposScrollArea( event );
					break;
				case arrKeyCodes.enter:
					var $activeItem = this.jobjects.itemList.children('.active');
					if ( $activeItem.length > 0 ) {
						event.targetItem = $activeItem[0];
					} else {
						event.targetItem = null;
					}
					this._itemSelect( event );
					break;
				case arrKeyCodes.tab:
					//tab
					break;

			}
			event.stopPropagation();
		},
		activateKeyHandlers: function () {
			var pluginObj = this;
			this.jobjects.enteredInput.bind( 'keydown', function ( event ) { pluginObj._keyHook( event );} );
			this.jobjects.enteredInput.bind( 'keypress', function ( event ) {
				for ( var x in arrKeyCodes ) {
					if ( arrKeyCodes.hasOwnProperty( x ) && (arrKeyCodes[x] === event.keyCode) ) {
						return false; // отсекаю обработку левых действий при нажатии функц клавиш
					}
				}
				return true;
			} );
		},
		deactivateKeyHandlers: function () {
			this.jobjects.enteredInput.unbind( 'keydown' );
			this.jobjects.enteredInput.unbind( 'keypress' );
		},
		_showEnteredField: function ( event ) {
			(! this.options.allowInput) && this.jobjects.enteredInput.attr( 'readonly', 'readonly' ) || this.jobjects.enteredInput.removeAttr( 'readonly', 'readonly' );
			this.options.allowInput && this.jobjects.visibleInput.hide();
			this.jobjects.enteredInput.show();
			this.jobjects.enteredInput.focus();
		},
		_hideEnteredField: function ( event ) {
			(! this.options.allowInput) && this.jobjects.enteredInput.attr( 'readonly', 'readonly' ) || this.jobjects.enteredInput.removeAttr( 'readonly', 'readonly' );
			this.jobjects.enteredInput.blur();
			this.jobjects.enteredInput.hide();
			this.jobjects.visibleInput.show();
		},
		_reposScrollArea: function ( event ) {
			if ( this.options.maxVisibleItems ) {
				var $activeItem = this.jobjects.itemList.children( '.active' );
				if ( $activeItem.length === 0 ) {
					$activeItem = this.jobjects.itemList.children( ':visible:first' );
					if ( $activeItem.length === 0 ) {
						return;
					}
				}

				var iItemHeight = $( this.jobjects.items[0] ).outerHeight();
				var iViewYRange = this.options.maxVisibleItems * iItemHeight;
				var iTopRange = this.jobjects.itemList.scrollTop();
				var iDownRange = iViewYRange;
				var iOffsetTop = $activeItem.position().top;
				if ( iOffsetTop < 0 ) {
					this.jobjects.itemList.scrollTop( iTopRange + iOffsetTop );
				} else if ( iOffsetTop >= iDownRange ) {
					this.jobjects.itemList.scrollTop( iTopRange + iOffsetTop - iDownRange + iItemHeight );
				}
			}
		},
		_resizeItemsList: function ( event ) {
			var iItemHeight = $( this.jobjects.items[0] ).outerHeight();
			var iCurrentMaxHeight = iItemHeight * this.jobjects.itemList.children( ':visible' ).length;
			var iItemListHeight = this.jobjects.items.length ? (this.options.maxVisibleItems * iItemHeight) : iCurrentMaxHeight;
			if ( iItemListHeight > iCurrentMaxHeight ) {
				iItemListHeight = iCurrentMaxHeight;
			}
			var sItemListHeight = iItemListHeight + 'px';
			this.jobjects.itemList.css( 'height', sItemListHeight );
		},
		_itemListShow: function ( event ) {
			this.jobjects.itemList.show();

			this._resizeItemsList( event );

			this.listVisible = true;
			$( document ).unbind( 'click' );

			this._trigger( 'listshow', 0, this );
		},
		_itemListHide: function ( event ) {
			this.jobjects.itemList.hide();
			this.listVisible = false;

			this._trigger( 'listhide', 0, this );
		},
		comboboxClose: function ( event ) {
			this._itemListHide( event );
			this._hideEnteredField( event );
		},
		comboboxOpen: function ( event ) {
			this._itemListShow( event );
			this._showEnteredField( event );
		},
		comboboxFocus: function ( event ) {
			var pluginObj = this;

			this._trigger( 'focus', 0, this );

			if ( this.listVisible ) {
				this.comboboxClose( event );
			} else {
				this.comboboxOpen( event );
			}

			// USE IN pluginObj as this
			$( document ).bind( 'click', function ( event ) {
				pluginObj.comboboxBlur();
			} );
		},
		comboboxBlur: function ( event ) {
			this._trigger( 'blur', 0, this );

			this.comboboxClose();
			$( document ).unbind( 'click' );
		},
		_comboboxClick: function ( event ) {
			this._trigger( 'click', 0, this );

			this.comboboxFocus( event );
			event.stopPropagation();
		},
		_filterList: function ( event ) {
			var enteredValue = this.jobjects.enteredInput.val();
			var items = this.jobjects.items;
			for ( var i = 0; i < items.length; i++ ) {
				var $item = $( items[i] );
				var filter = $item.attr( 'data-filter' );
				if ( ! ((filter !== undefined) && (filter.match( enteredValue ) !== null)) ) {
					$item.hide();
				} else {
					$item.show();
				}
			}
			var $activeItem = this.jobjects.itemList.children( '.active:visible' );
			if ( $activeItem.length === 0 ) {
				this.jobjects.itemList.children().removeClass( 'active' );
			}
			this._resizeItemsList( event );
		},
		_itemSelect: function ( event ) {
			this.itemSelect( event );
			this.comboboxClose();
		},
		itemSelect: function ( event ) {
			var $activeItem = (event.targetItem === undefined) ? $( event.currentTarget ) : $( event.targetItem );

			this.jobjects.itemList.children().removeClass( 'active' );
			if ( $activeItem.length === 0 ) {
				return;
			}

			this.jobjects.activeItem = $activeItem;

			var value = $activeItem.attr( 'data-value' );
			this.jobjects.visibleInput.html( $activeItem.html() );
			this.jobjects.titleInput.val( $activeItem.text() );
			this.jobjects.valueInput.val( value );

			$activeItem.addClass( 'active' );

			this._trigger( 'change', 0, $activeItem );
		},
		select: function ( dataValue ) {
			var $activeItem = this.jobjects.itemList.children( '[data-value='+dataValue+']:first' );
			if ( $activeItem.length > 0) {
				this.itemSelect( {targetItem: $activeItem[0]} );
			}
		},
		_itemClick: function ( event ) {
			this._itemSelect( event );

			this._trigger( 'listclick', 0, this );
			this._trigger( 'click', 0, this );

			event.stopPropagation();
		},

		_create: function() {
			var pluginObj = this;
			/**
			 * jQuery.ui.widget::options
			 */
			this.listVisible = false;
			if ( ! this.options.source ) {
				this.options.source = this.element;
			}
			if ( ! this.options.target ) {
				this.options.target = this.element;
			}

			var sStyle = ' .jqcmbx {width:' + this.options.width + ';position:relative;font:.8em Arial, Verdana, serf;} ' +
			' .jqcmbx-input {position: relative;} .jqcmbx-input-border {position:relative;width:100%;height:' + this.options.height + ';border:1px solid #abadb3;cursor:default;}' +
			' .jqcmbx-input .jqcmbx-input-visible {width:100%;height:100%;}' +
			' .jqcmbx-input .input-size {position:absolute;left:0px;right:21px;z-index:2;}' +
			' .jqcmbx-input .input-size input {width:100%;border:none;background:transparent;}' +
			' .jqcmbx-input span.jqcmbx-opener {position:absolute;right:-1px;top:1px;height:20px;width:14px;z-index:2}' +
			' .jqcmbx-input span.jqcmbx-opener:hover {background-position: 0 40px;}' +
			' .jqcmbx-input span.jqcmbx-opener:active {background-position: 0 20px;}' +
			' .jqcmbx-ul {list-style-position:inside;list-style-type:none;font-size:1em;background:white;border:1px solid black;display:none;position:absolute;margin:0px;padding:0px;width:100%;overflow-y:auto;}' +
			' .jqcmbx-li {position:relative;margin:0px; padding:0px 0px 0px 5px;height:' + this.options.height + ';cursor:default;} ' +
			' .jqcmbx-li:hover, .jqcmbx-li.active {background:#3399ff;color:white;}';
			$( 'head' ).prepend( '<style>' + sStyle + '</style>' );

			var $select = $( this.options.target );
			this.element = $select;
			var $source = $( this.options.source );
			var $items = $select.children( 'option' );
			/* Selected Item */
			var selectedItem = $select.children( 'option[selected]' );
			var selectedValue = selectedItem.val();
			var selectedDataVal = selectedItem.attr( 'data-value' );
			if ( selectedDataVal === undefined ) {
				selectedDataVal = selectedValue;
			}

			var arrConfig = {};
			arrConfig.id		=	$source.attr( 'id' );
			arrConfig.name		=	$source.attr( 'name' );
			arrConfig.titlename	=	$source.attr( 'data-titlename' );
			var ti = $source.attr( 'tabindex' );
			arrConfig.tabindex	= 	(this.options.tabindex === true) ? (function() { return ti ? 'tabindex='+ti : '';})() : (function() {return (pluginObj.options.tabindex === false) ? '' : 'tabindex='+pluginObj.options.tabindex;})();

			$.template( 'comboBoxTmpl', '<div id="${id}" class="jqcmbx"><div class="jqcmbx-input">' +
					'<div class="input-size"><input name="jqcmbx_entered_value" type="text" ${tabindex} /></div>' +
					'<div class="jqcmbx-input-border"><div class="jqcmbx-input-visible"></div></div>' +
					'<input name="${titlename}" class="jqcmbx-input-title" type="hidden"/><input name="${name}" class="jqcmbx-input-name" type="hidden"/>' +
					'<span class="jqcmbx-opener" />' +
					'</div></div>' );
			$.template( 'optionTmpl', this.options.templateItem );
			$.template( 'optGroupTmpl', this.options.templateItem );

			var $itemList = $( this.options.templateList ).addClass( 'jqcmbx-ul' ); //FIXME: необходимо искать самый глубокий элемент и брать его как контейнер списка
			var arrItemsData = prepareData( $items );
			$items = $.tmpl( 'optionTmpl', arrItemsData ).addClass( 'jqcmbx-li' );
			$items.appendTo( $itemList );

			var $comboBox	= $.tmpl( 'comboBoxTmpl', arrConfig );
			var $enteredInput= $comboBox.find( 'input[name=jqcmbx_entered_value]' );
			if ( ! this.options.allowInput ) {
				$enteredInput.remove();
			}
			var $visibleInput= $comboBox.find( '.jqcmbx-input-visible' );
			var $titleInput	= $comboBox.find( 'input.jqcmbx-input-title' );
			var $valueInput	= $comboBox.find( 'input.jqcmbx-input-name' );
			$comboBox.append( $itemList );

			$comboBox.bind( 'keyup', function( event ) { pluginObj._filterList( event ); } );
			$items.bind( 'click', function( event ) { pluginObj._itemClick( event ); } );
			$comboBox.bind( 'click', function( event ) { pluginObj._comboboxClick( event ); } );
			$select.replaceWith( $comboBox );

			this.jobjects = {
					combobox	: $comboBox,
					enteredInput: $enteredInput,
					visibleInput: $visibleInput,
					titleInput	: $titleInput,
					valueInput	: $valueInput,
					itemList	: $itemList,
					items		: $items,
					activeItem  : undefined
			};

			this.select( selectedDataVal );

			this.activateKeyHandlers();
		},

		value: function () {
			return this.jobjects.valueInput.val();
		}
	};

	$.widget( "ui.comboboxtmpl", pluginObject );
//} )( jQuery, document );
