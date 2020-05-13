import React from 'react';
import Card from "react-bootstrap/Card";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './scss/App.scss';
import $ from 'jquery';

class App extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.onClick = this.onClickNext.bind(this);
    this.onClickRPP = this.onClickRPP.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);

    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      getpagesarray: [],
      totalitems: 0,
      page: 1,
      itemsPerPage: 20,
      typedvalue: '',
      searchedvalue: '',
    };
  }

  componentDidMount() {
    // get json data from books api
    this._isMounted = true;

    // get url parameter if page number has been added
    let params = (new URL(document.location)).searchParams;
    let getpageurl = params.get('page');
    if (getpageurl != null){
      this.setState({page: parseInt(getpageurl)});
    }
    fetch("http://nyx.vima.ekt.gr:3000/api/books/", {
      method: "post",
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        page: this.state.page,
        itemsPerPage: this.state.itemsPerPage,
        filters: []
      })
    })
    .then((response) => response.json())
    .then((response) => {
        this.setState({
          items: response['books'],
          totalitems: response['count'],
          isLoaded: true,
          getpagesarray: Array.from(Array(Math.ceil(response['count']/this.state.itemsPerPage)).keys())
        });

        // console.log("messages: " + messages['books']);

      });

      // remove parameter from url
      // window.history.replaceState(null, null, window.location.pathname);

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log("componentDidUpdate: page - " + prevState.page + " itemsPerPage - " + prevState.itemsPerPage);

    // don't update if state hasn't changed
    if ((prevState.page !== this.state.page) || (prevState.itemsPerPage !== this.state.itemsPerPage) || (prevState.searchedvalue !== this.state.searchedvalue)) {

      // when someone clicks next/prev or items per page
      fetch("http://nyx.vima.ekt.gr:3000/api/books/", {
        method: "post",
        headers : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          page: this.state.page,
          itemsPerPage: this.state.itemsPerPage,
          filters: [{type: "all", values: [this.state.searchedvalue]}]
          // filters: [{type: "all", values: ["Hertzberg"]}]
        })
      })
      .then((response) => response.json())
      .then((response) => {
          this.setState({
            items: response['books'],
            isLoaded: true,
            totalitems: response['count'],
            getpagesarray: Array.from(Array(Math.ceil((response['count']+20)/this.state.itemsPerPage)).keys())
          });
          // console.log("messages: " + messages['books']);
        });

    }

    // update page parameter in url
    window.history.replaceState(null, null, "/?page=" + parseInt(this.state.page));

    // apply active class to page 1
    $(".book-listing-page").removeClass('book-listing-page-active');
    $(".book-listing-page.page-" + this.state.page).addClass('book-listing-page-active');

  }

  // get next or previous page or if someone clicks a page number
  onClickNext(nextprev) {
    // prev and next only availble if more than 20 results
    if ((this.state.searchedvalue !== "") || (this.state.totalitems <20)){
    } else {

      // if a page number is selected
      if ((nextprev !== 'prev') && (nextprev !== 'next')){
        this.setState({page: nextprev});
      } else {

        let lastpage = Math.ceil(this.state.totalitems/this.state.itemsPerPage);
        if (nextprev === "next"){
          // if current page is lastpage then get page 1
          if (this.state.page === lastpage){
            this.setState({
              page: 1,
            })
          } else {
            this.setState({
              page: this.state.page + 1,
            })
          }
          // if current page is 1 then get lastpage
        } else if (this.state.page === 1){
          this.setState({
            page: lastpage,
          })
          } else {
            this.setState({
              page: this.state.page - 1,
            })
        }

        // console.log("onClick: " + nextprev);

      }

    }
  }

  // change results per page
  onClickRPP(itemsPerPage){
    // console.log("itemsPerPage: " + itemsPerPage);
    // this.setState({
    //   itemsPerPage: parseInt(itemsPerPage),
    // })
  }

  handleChange(event) {
    this.setState({typedvalue: event.target.value});
  }

  handleSubmit(event) {
    this.setState({searchedvalue: this.state.typedvalue, page: 1,});
    event.preventDefault();
  }

  handleClearForm(){
    this.setState({searchedvalue: "", typedvalue: ""});
  }

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="book-listing-container">

          <div className="book-listing-total" >Total Items: {this.state.totalitems}</div>

          <form className="book-listing-form" onSubmit={this.handleSubmit}>
            <label>
              <input type="text" placeholder="Book Search..." value={this.state.typedvalue} onChange={this.handleChange} />
            </label>
            <input onClick={this.handleClearForm} type="reset" value="Reset" />
            <input type="submit" value="Search" />
          </form>

          <Button className="btn-prev" onClick={this.onClickNext.bind(this, 'prev')}>Prev</Button>
          <Button className="btn-next"onClick={this.onClickNext.bind(this, 'next')}>Next</Button>

          <div className="book-listing-paginate" id="book-listing-paginate">
            {this.state.getpagesarray.slice(1).map(item => (
              <span className={`book-listing-page page-${item}`} key={item} onClick={this.onClickNext.bind(this, item)}>{item}</span>
            ))}
          </div>

          {/*<Button onClick={this.onClickRPP.bind(this, '20')}>20</Button>
          <Button onClick={this.onClickRPP.bind(this, '50')}>50</Button>
          <Button onClick={this.onClickRPP.bind(this, '100')}>100</Button>*/}

          <div className="book-listing-items">

            {this.state.items.map(item => (

              <Card className="card-custom-sml" bg="primary" key={item.id}>
                <Card.Header as="h5">{item.book_title}</Card.Header>
                <Card.Body>
                  <Card.Title>{item.book_author}</Card.Title>
                  <Card.Text>
                    <span>Year: {item.book_publication_year}</span>
                    <span>Country: {item.book_publication_country}</span>
                    <span>City: {item.book_publication_city}</span>
                    <span>Pages: {item.book_pages}</span>
                  </Card.Text>
                </Card.Body>
              </Card>

            ))}

          </div>

        </div>

      );
    }
  }
}

export default App;
